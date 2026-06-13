"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { useRouter } from "next/navigation";

interface SocialCalendarEvent {
  id: string;
  title: string;
  start: string;
}

export function SocialCalendar({ events }: { events: SocialCalendarEvent[] }) {
  const router = useRouter();

  return (
    <div className="rounded-lg border p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,dayGridWeek" }}
        events={events}
        eventClick={(info) => router.push(`/admin/social/${info.event.id}`)}
        height="auto"
      />
    </div>
  );
}
