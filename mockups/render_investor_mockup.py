from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


OUT = Path(__file__).with_name("mindflow-investor-mockup.jpg")
W, H = 1920, 1080


def font(size, bold=False):
    paths = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for path in paths:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


F = {
    "logo": font(30, True),
    "eyebrow": font(18, True),
    "hero": font(58, True),
    "body": font(25),
    "section": font(24, True),
    "label": font(17, True),
    "small": font(15),
    "kpi": font(44, True),
    "big": font(70, True),
    "insight": font(22, True),
}


NAVY = "#101324"
INK = "#15162a"
MUTED = "#6f7187"
LIGHT = "#f6f4ef"
PAPER = "#ffffff"
LINE = "#dfdce8"
TEAL = "#36c5b5"
ROSE = "#ef9fa8"
AMBER = "#f3b35c"
PURPLE = "#7c5cff"
GREEN = "#42b883"


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text(draw, xy, value, fill, fnt, anchor=None):
    draw.text(xy, value, fill=fill, font=fnt, anchor=anchor)


def wrap(draw, value, fnt, width):
    lines, line = [], ""
    for word in value.split():
        test = f"{line} {word}".strip()
        if draw.textbbox((0, 0), test, font=fnt)[2] <= width:
            line = test
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def multiline(draw, xy, value, fill, fnt, width, line_height):
    x, y = xy
    for line in wrap(draw, value, fnt, width):
        text(draw, (x, y), line, fill, fnt)
        y += line_height


def make_background():
    img = Image.new("RGB", (W, H), LIGHT)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        r = int(246 - y * 0.010)
        g = int(244 - y * 0.008)
        b = int(239 + y * 0.008)
        draw.line((0, y, W, y), fill=(r, g, b))
    return img


def draw_header(draw):
    rounded(draw, (80, 64, 132, 116), 14, PURPLE)
    text(draw, (106, 90), "M", "white", F["logo"], "mm")
    text(draw, (150, 73), "MindFlow Journal", INK, F["logo"])
    rounded(draw, (80, 150, 360, 194), 22, "#e8fbf8", "#bfeee8")
    text(draw, (104, 161), "INVESTOR PRODUCT MOCKUP", TEAL, F["eyebrow"])
    text(draw, (80, 238), "AI wellness dashboard", INK, F["hero"])
    multiline(
        draw,
        (80, 315),
        "A simple product view showing mood trends, habit streaks, and AI insights investors can understand in seconds.",
        MUTED,
        F["body"],
        760,
        36,
    )

    kpis = [
        ("38.4K", "Monthly active journalers", "+18% MoM"),
        ("46%", "D30 habit retention", "+9 pts"),
        ("71%", "AI insight open rate", "+14% QoQ"),
    ]
    x0 = 1000
    for i, (value, label, delta) in enumerate(kpis):
        x = x0 + i * 280
        rounded(draw, (x, 86, x + 240, 240), 18, PAPER, LINE, 2)
        text(draw, (x + 28, 116), value, INK, F["kpi"])
        multiline(draw, (x + 28, 170), label, MUTED, F["label"], 160, 24)
        text(draw, (x + 28, 216), delta, GREEN, F["label"])


def draw_phone(draw):
    x, y, w, h = 80, 455, 500, 520
    rounded(draw, (x, y, x + w, y + h), 46, NAVY)
    rounded(draw, (x + 28, y + 28, x + w - 28, y + h - 28), 32, "#171b31")
    text(draw, (x + 58, y + 62), "Today", "white", F["section"])
    text(draw, (x + 58, y + 100), "Mood score", "#aeb2c8", F["small"])
    text(draw, (x + 58, y + 124), "4.3", "white", F["big"])
    text(draw, (x + 184, y + 158), "+0.6 vs last week", TEAL, F["label"])

    rounded(draw, (x + 58, y + 235, x + w - 58, y + 308), 18, "#222741")
    text(draw, (x + 84, y + 254), "12 day streak", "white", F["section"])
    text(draw, (x + 84, y + 286), "Reflection habit strengthening", "#aeb2c8", F["small"])

    rounded(draw, (x + 58, y + 340, x + w - 58, y + 444), 18, "#222741")
    text(draw, (x + 84, y + 362), "AI insight", "white", F["section"])
    multiline(draw, (x + 84, y + 398), "Sleep quality is driving next-day mood.", "#c8cad8", F["small"], 315, 22)


def draw_mood_chart(draw):
    x, y, w, h = 640, 455, 610, 310
    rounded(draw, (x, y, x + w, y + h), 24, PAPER, LINE, 2)
    text(draw, (x + 32, y + 30), "Mood trend", INK, F["section"])
    text(draw, (x + w - 32, y + 30), "+30%", GREEN, F["kpi"], "ra")
    text(draw, (x + 32, y + 66), "Average mood improves as weekly journaling becomes consistent.", MUTED, F["small"])

    cx, cy, cw, ch = x + 42, y + 112, w - 84, 145
    for i in range(4):
        yy = cy + i * ch / 3
        draw.line((cx, yy, cx + cw, yy), fill="#ece9f2", width=2)
    vals = [42, 46, 51, 49, 58, 63, 68, 72]
    pts = []
    for i, v in enumerate(vals):
        px = cx + i * cw / 7
        py = cy + ch - (v - 35) / 45 * ch
        pts.append((px, py))
    draw.polygon(pts + [(cx + cw, cy + ch), (cx, cy + ch)], fill="#fce4e7")
    draw.line(pts, fill=ROSE, width=7, joint="curve")
    draw.line(pts[:5], fill=AMBER, width=7, joint="curve")
    draw.line(pts[:3], fill=TEAL, width=7, joint="curve")
    for px, py in pts:
        draw.ellipse((px - 8, py - 8, px + 8, py + 8), fill=PAPER, outline=ROSE, width=4)
    for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]):
        text(draw, (cx + i * cw / 7, y + 276), m, MUTED, F["small"], "mm")


def draw_streaks(draw):
    x, y, w, h = 1290, 455, 550, 310
    rounded(draw, (x, y, x + w, y + h), 24, PAPER, LINE, 2)
    text(draw, (x + 32, y + 30), "Habit streaks", INK, F["section"])
    text(draw, (x + 32, y + 66), "Retention signal from consistent reflection behavior.", MUTED, F["small"])
    levels = [0, 2, 3, 1, 4, 4, 2, 0, 3, 4, 1, 2, 4, 4, 3, 0, 2, 3, 4, 1, 4, 3, 2, 0, 1, 3, 4, 4, 2, 3, 0, 2, 4, 4, 4, 3, 1, 0, 2, 3, 4, 2, 4, 4, 3, 1, 2, 0]
    colors = ["#e9e7f0", "#cfd0dc", TEAL, AMBER, ROSE]
    gx, gy = x + 34, y + 116
    for i, level in enumerate(levels):
        col, row = i % 12, i // 12
        rounded(draw, (gx + col * 40, gy + row * 40, gx + col * 40 + 29, gy + row * 40 + 29), 6, colors[level])
    stats = [("21", "median streak"), ("64%", "weekly active"), ("5.8", "logs/week")]
    for i, (value, label) in enumerate(stats):
        bx = x + 34 + i * 160
        rounded(draw, (bx, y + 246, bx + 138, y + 286), 12, "#f7f6fb", "#e4e1ee")
        text(draw, (bx + 18, y + 254), value, INK, F["label"])
        text(draw, (bx + 58, y + 255), label, MUTED, F["small"])


def draw_insights(draw):
    x, y, w, h = 640, 805, 1200, 170
    rounded(draw, (x, y, x + w, y + h), 24, NAVY)
    text(draw, (x + 34, y + 28), "AI insights investors can see", "white", F["section"])
    cards = [
        ("Sleep is the strongest lever", "31% higher next-day mood", "High confidence"),
        ("Stress clusters on Tuesdays", "Coaching moment detected", "Emerging pattern"),
        ("Gratitude prompts retain users", "1.8x next-week return", "Retention driver"),
    ]
    for i, (title, body, badge) in enumerate(cards):
        bx = x + 34 + i * 374
        rounded(draw, (bx, y + 72, bx + 342, y + 148), 16, "#1b2038", "#2d3350")
        text(draw, (bx + 18, y + 88), title, "white", F["insight"])
        text(draw, (bx + 18, y + 120), body, "#bcc0d2", F["small"])
        rounded(draw, (bx + 205, y + 114, bx + 322, y + 139), 12, "#132e35", "#2d655f")
        text(draw, (bx + 263, y + 119), badge, TEAL, font(12, True), "mt")


def main():
    img = make_background()
    draw = ImageDraw.Draw(img)
    draw_header(draw)
    draw_phone(draw)
    draw_mood_chart(draw)
    draw_streaks(draw)
    draw_insights(draw)
    img.save(OUT, "JPEG", quality=95, optimize=True)
    print(OUT)


if __name__ == "__main__":
    main()
