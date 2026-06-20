import CreateEventForm from "@/components/CreateEventForm";
import MyScheduleSection from "@/components/MyScheduleSection";
import VisitedEventsSection from "@/components/VisitedEventsSection";

export default function Home() {
  return (
    <main style={{ maxWidth: "520px", margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "6px", textAlign: "center" }}>
        일정 조율
      </h1>
      <p style={{ color: "var(--text-secondary)", textAlign: "center", marginBottom: "24px", fontSize: "13px" }}>
        모두가 가능한 시간을 찾아보세요
      </p>

      <CreateEventForm />
      <MyScheduleSection />
      <VisitedEventsSection />
    </main>
  );
}
