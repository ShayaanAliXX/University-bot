export const universityData = [
    {
        category: "Admissions",
        keywords: ["admission", "apply", "deadline", "procedure", "requirements", "eligibility"],
        content: "Admissions for the 2026 academic year are open. The deadline for undergraduate applications is June 30th. Eligibility requires a minimum of 75% in 12th grade Science stream. You can apply via the portal at apply.university.edu."
    },
    {
        category: "Computer Science Course",
        keywords: ["computer science", "cse", "cs", "coding", "programming", "curriculum", "syllabus"],
        content: "The B.Tech in Computer Science Engineering (CSE) is a 4-year program. It covers Data Structures, Algorithms, AI/ML, Web Development, and Cloud Computing. The department is led by Dr. A. Sharma. Top recruiters include Google, Microsoft, and Amazon."
    },
    {
        category: "Library",
        keywords: ["library", "books", "timing", "open", "close", "borrow", "reading"],
        content: "The Central Library is open from 8:00 AM to 10:00 PM on weekdays and 9:00 AM to 5:00 PM on weekends. Students can borrow up to 4 books at a time for 14 days. Late fees are $1 per day."
    },
    {
        category: "Events",
        keywords: ["event", "fest", "hackathon", "workshop", "cultural", "sports"],
        content: "Upcoming events: 1. 'TechNova' Annual Tech Fest - March 15th-17th. 2. Inter-college Hackathon - April 5th. 3. Sports Meet - February 20th. Registration links are available on the student dashboard."
    },
    {
        category: "Contact",
        keywords: ["contact", "email", "phone", "number", "address", "location", "help"],
        content: "You can contact the administration office at admin@university.edu or call +1-234-567-890. The campus is located at 123 Education Lane, Knowledge City."
    },
    {
        category: "Fees",
        keywords: ["fee", "tuition", "cost", "price", "scholarship", "financial aid"],
        content: "The annual tuition fee for engineering courses is $15,000. Hostel fees are $5,000 per year. Merit-based scholarships are available for students with >90% grades."
    },
    {
        category: "Exam",
        keywords: ["exam", "test", "schedule", "timetable", "results", "midterm", "final"],
        content: "Mid-term exams start from October 10th. Final semester exams are scheduled for December 15th. Results are usually declared 4 weeks after the last exam."
    }
];

export const retrieveContext = (query) => {
    const lowerQuery = query.toLowerCase();

    // Simple keyword matching scoring
    const scoredData = universityData.map(item => {
        let score = 0;
        item.keywords.forEach(keyword => {
            if (lowerQuery.includes(keyword)) {
                score += 1;
            }
        });
        return { ...item, score };
    });

    // Filter relevant items and sort by score
    const relevantItems = scoredData
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Top 3 results

    if (relevantItems.length === 0) return null;

    return relevantItems.map(item => `[${item.category}]: ${item.content}`).join("\n\n");
};
