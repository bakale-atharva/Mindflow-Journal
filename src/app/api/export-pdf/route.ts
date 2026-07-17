import { NextResponse } from 'next/server';
import { createClient } from '@/lib/client';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ProgramInsight } from '@/lib/program-review';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Require authentication via the cookie
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the insight
    const { data: insightData, error } = await supabase
      .from('ai_program_insights')
      .select('report_json, expires_at')
      .eq('user_id', user.id)
      .single();

    if (error || !insightData || !insightData.report_json) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    if (new Date(insightData.expires_at) <= new Date()) {
      return NextResponse.json({ error: 'Insight has expired' }, { status: 400 });
    }

    const insight = insightData.report_json as ProgramInsight;

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let y = height - 50;
    const margin = 50;

    const drawText = (text: string, size: number, isBold = false, color = rgb(0.14, 0.13, 0.21)) => {
      // Basic text wrapping
      const maxWidth = width - margin * 2;
      const f = isBold ? fontBold : font;
      const words = text.split(' ');
      let line = '';
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const testWidth = f.widthOfTextAtSize(testLine, size);
        if (testWidth > maxWidth && i > 0) {
          page.drawText(line, { x: margin, y, size, font: f, color });
          y -= size + 6;
          line = words[i] + ' ';
        } else {
          line = testLine;
        }
      }
      
      page.drawText(line, { x: margin, y, size, font: f, color });
      y -= size + 14;

      if (y < margin) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
    };

    drawText("MindFlow: Your 7-Day Clarity Map", 24, true, rgb(0.45, 0.32, 0.68));
    y -= 10;
    
    drawText(insight.overview, 12);
    y -= 15;

    if (insight.recurring_threads?.length > 0) {
      drawText("RECURRING THREADS", 10, true, rgb(0.47, 0.44, 0.53));
      y -= 5;
      insight.recurring_threads.forEach(thread => {
        drawText(`${thread.label} (Days ${thread.evidence_days?.join(", ")})`, 12, true);
        drawText(thread.explanation, 12);
        y -= 10;
      });
      y -= 10;
    }

    if (insight.perspective_shifts?.length > 0) {
      drawText("PERSPECTIVE SHIFTS", 10, true, rgb(0.47, 0.44, 0.53));
      y -= 5;
      insight.perspective_shifts.forEach(shift => {
        drawText(`• ${shift.explanation} (Days ${shift.evidence_days?.join(", ")})`, 12);
        y -= 5;
      });
      y -= 15;
    }

    if (insight.clarity_in_practice?.length > 0) {
      drawText("CLARITY IN PRACTICE", 10, true, rgb(0.47, 0.44, 0.53));
      y -= 5;
      insight.clarity_in_practice.forEach(practice => {
        drawText(`• ${practice.explanation} (Days ${practice.evidence_days?.join(", ")})`, 12);
        y -= 5;
      });
      y -= 15;
    }

    drawText("CARRY FORWARD", 10, true, rgb(0.47, 0.44, 0.53));
    y -= 5;
    drawText(`"${insight.carry_forward}"`, 14, false);

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="MindFlow_Clarity_Map.pdf"',
      },
    });

  } catch (error) {
    console.error('PDF export failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
