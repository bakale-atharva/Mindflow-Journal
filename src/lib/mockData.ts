export const mockEntries = [
  {
    id: "1",
    content: "Today felt overwhelming at first, but taking a walk during lunch completely shifted my perspective. I noticed the small details—a yellow flower blooming from a crack in the pavement. It reminded me that resilience is everywhere.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    mood: 4,
    tags: ["work", "mindfulness", "nature"],
    hasInsight: true,
  },
  {
    id: "2",
    content: "Woke up feeling a bit anxious about the upcoming project deadline. Tried to do some deep breathing but my mind kept racing. Note to self: prioritize tasks tomorrow morning instead of checking emails first thing.",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1 day, 2 hrs ago
    mood: 2,
    tags: ["anxiety", "work", "planning"],
    hasInsight: false,
  },
  {
    id: "3",
    content: "Had an amazing coffee chat with Sarah today! It's so refreshing to connect with someone who understands my weird sense of humor. We talked for hours about life and our future plans.",
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(), // ~2 days ago
    mood: 5,
    tags: ["friends", "social", "joy"],
    hasInsight: true,
  },
  {
    id: "4",
    content: "Just feeling very average today. Nothing bad happened, nothing incredibly good either. Just a calm, quiet, routine Tuesday. Sometimes that's exactly what I need.",
    createdAt: new Date(Date.now() - 74 * 60 * 60 * 1000).toISOString(), // ~3 days ago
    mood: 3,
    tags: ["routine", "calm"],
    hasInsight: false,
  },
  {
    id: "5",
    content: "Missed my morning workout and felt guilty about it all day. I need to be more compassionate with myself when things don't go perfectly according to plan.",
    createdAt: new Date(Date.now() - 98 * 60 * 60 * 1000).toISOString(), // ~4 days ago
    mood: 2,
    tags: ["fitness", "self-compassion"],
    hasInsight: true,
  },
];
