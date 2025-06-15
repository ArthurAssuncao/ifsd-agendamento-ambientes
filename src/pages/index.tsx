// pages/index.js
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LoginPage } from "@/components/LoginPage/LoginPage";
import { NavBar } from "@/components/NavBar";
import { Schedules } from "@/components/scheduling/Schedules";
import { StatusBar } from "@/components/StatusBar";
import {
  getDateFromLastOfWeek,
  getDateFromWeek,
  getNextWeek,
  getPreviousWeek,
  getWeekNumber,
  MAX_WEEKS_TO_SHOW,
} from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { ToastContainer } from "react-toastify";

export default function Home() {
  const { data: session, status } = useSession();

  // const { schedule } = useSchedule(true);

  const currentWeekNumber = getWeekNumber(new Date());

  const [currentWeek, setCurrentWeek] = useState<number>(currentWeekNumber);
  const optionsDateFormat = {
    weekday: undefined,
    year: undefined,
    month: "long",
    day: "numeric",
  } as Intl.DateTimeFormatOptions;
  const maxWeeks = MAX_WEEKS_TO_SHOW; // Número máximo de semanas para exibir

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
          <div className="flex flex-col items-center gap-2 pt-2 w-full lg:w-sm">
            <span>
              Semana {currentWeek} do dia{" "}
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

        <Schedules currentWeek={currentWeek} />
      </main>

      {/* <ListActivities /> */}

      <StatusBar />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Rodapé */}
      <Footer />
    </div>
  );
}
