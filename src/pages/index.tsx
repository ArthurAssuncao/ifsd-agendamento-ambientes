// pages/index.js
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LoginPage } from "@/components/LoginPage/LoginPage";
import { NavBar } from "@/components/NavBar";
import { TimeTable } from "@/components/scheduling/TimeTable";
import { StatusBar } from "@/components/StatusBar";
import {
  getDateFromLastOfWeek,
  getDateFromWeek,
  getNextWeek,
  getPreviousWeek,
  getWeekNumber,
} from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";

export default function Home() {
  const { data: session, status } = useSession();
  const [currentLab, setCurrentLab] = useState<string>("LabInf1");

  const currentWeekNumber = getWeekNumber(new Date());

  const [currentWeek, setCurrentWeek] = useState<number>(currentWeekNumber);
  const optionsDateFormat = {
    weekday: undefined,
    year: undefined,
    month: "long",
    day: "numeric",
  } as Intl.DateTimeFormatOptions;
  const maxWeeks = 4; // Número máximo de semanas para exibir

  // console.log("Session data:", session);
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        {/* Navbar */}
        <NavBar />

        {/* Conteúdo Principal */}
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <p>Carregando...</p>
        </main>

        {/* Rodapé */}
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        {/* Navbar */}
        <NavBar />

        {/* Conteúdo Principal */}
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <LoginPage />
        </main>

        {/* Rodapé */}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Navbar */}
      <NavBar />

      {/* Conteúdo Principal */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center ">
        <div className="flex text-lg font-semibold items-start justify-center gap-2 mb-4">
          <div>
            <button
              onClick={() =>
                setCurrentWeek((prev) =>
                  currentWeekNumber < prev
                    ? getPreviousWeek(prev, maxWeeks, currentWeekNumber)
                    : prev
                )
              }
            >
              <FaChevronCircleLeft
                size={42}
                className="hover:text-green-700 hover:cursor-pointer transition-colors"
              />
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 pt-2 w-[340px]">
            <span>
              Semana do dia{" "}
              {getDateFromWeek(currentWeek).toLocaleDateString(
                "pt-br",
                optionsDateFormat
              )}{" "}
              a{" "}
              {getDateFromLastOfWeek(currentWeek).toLocaleDateString(
                "pt-br",
                optionsDateFormat
              )}{" "}
            </span>
            <span>Laboratório: {currentLab}</span>
          </div>
          <div>
            <button
              onClick={() =>
                setCurrentWeek((next) =>
                  getNextWeek(next, maxWeeks, currentWeekNumber)
                )
              }
            >
              <FaChevronCircleRight
                size={42}
                className="hover:text-green-700 hover:cursor-pointer transition-colors"
              />
            </button>
          </div>
        </div>
        <TimeTable labId={currentLab} week={currentWeek} />
      </main>

      <StatusBar />

      {/* Rodapé */}
      <Footer />
    </div>
  );
}
