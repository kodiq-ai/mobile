import WidgetKit
import SwiftUI

// MARK: - Data Model

struct StreakData {
    let streak: Int
    let challengeDone: Bool

    static let placeholder = StreakData(streak: 5, challengeDone: false)

    static func load() -> StreakData {
        let defaults = UserDefaults(suiteName: "group.ai.kodiq")
        let streak = defaults?.integer(forKey: "streak_count") ?? 0
        let challengeDone = defaults?.bool(forKey: "challenge_done") ?? false
        return StreakData(streak: streak, challengeDone: challengeDone)
    }
}

// MARK: - Timeline Entry

struct StreakEntry: TimelineEntry {
    let date: Date
    let data: StreakData
}

// MARK: - Timeline Provider

struct StreakTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> Void) {
        completion(StreakEntry(date: Date(), data: StreakData.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> Void) {
        let entry = StreakEntry(date: Date(), data: StreakData.load())
        // Refresh every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: - Widget View

struct StreakWidgetView: View {
    var entry: StreakEntry

    var streakLabel: String {
        let n = entry.data.streak
        if n == 0 { return "начни серию!" }
        if n == 1 { return "день подряд" }
        if n >= 2 && n <= 4 { return "дня подряд" }
        return "дней подряд"
    }

    var body: some View {
        VStack(spacing: 4) {
            Text("🔥")
                .font(.system(size: 32))

            Text("\(entry.data.streak)")
                .font(.system(size: 28, weight: .bold, design: .monospaced))
                .foregroundColor(Color(red: 0, green: 0.83, blue: 0.67))

            Text(streakLabel)
                .font(.system(size: 11, design: .monospaced))
                .foregroundColor(Color(white: 0.55))

            Text(entry.data.challengeDone ? "✅ Урок выполнен" : "⬜ Урок на сегодня")
                .font(.system(size: 10, design: .monospaced))
                .foregroundColor(Color(white: 0.8))
                .padding(.top, 4)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            Color(red: 0.1, green: 0.1, blue: 0.18)
        }
    }
}

// MARK: - Widget Configuration

@main
struct StreakWidget: Widget {
    let kind: String = "StreakWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StreakTimelineProvider()) { entry in
            StreakWidgetView(entry: entry)
        }
        .configurationDisplayName("Kodiq Streak")
        .description("Streak и ежедневный прогресс")
        .supportedFamilies([.systemSmall])
    }
}
