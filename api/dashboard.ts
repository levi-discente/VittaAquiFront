import api from "./api";
import { Appointment } from "../types/appointment";

export interface DashboardStats {
  todayRevenue: number;
  todayAppointments: number;
  todayAppointmentsCompleted: number;
  todayAppointmentsPending: number;
  monthlyConsultations: number;
  monthlyConsultationsGrowth: number;
  newPatientsThisMonth: number;
  newPatientsGrowth: number;
  satisfactionRate: number;
}

export interface MonthlyConsultation {
  month: string;
  consultas: number;
  novas: number;
}

export interface PatientSummary {
  id: number;
  avatar: string;
  nome: string;
  idade: number;
  ultimaConsulta: string;
  proximaConsulta: string;
  status: "Ativo" | "Pendente" | "Inativo";
  prioridade: "Alta" | "Média" | "Baixa";
  profile_image_url?: string;
}

/**
 * Get dashboard statistics for the current professional
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get today's appointments
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // Get all appointments for the professional
    const appointments = await api.get<Appointment[]>(
      "/appointments/my-appointments"
    );
    const allAppointments = appointments.data;

    // Filter today's appointments
    const todayAppointments = allAppointments.filter((apt) => {
      const aptDate = new Date(apt.start_time);
      return aptDate >= new Date(startOfDay) && aptDate <= new Date(endOfDay);
    });

    // Calculate today's stats
    const todayAppointmentsCompleted = todayAppointments.filter(
      (apt) => apt.status === "completed"
    ).length;
    const todayAppointmentsPending = todayAppointments.filter(
      (apt) => apt.status === "pending" || apt.status === "confirmed"
    ).length;

    // Get current month appointments
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyAppointments = allAppointments.filter((apt) => {
      const aptDate = new Date(apt.start_time);
      return aptDate >= startOfMonth;
    });

    // Get previous month for growth calculation
    const startOfPrevMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const prevMonthAppointments = allAppointments.filter((apt) => {
      const aptDate = new Date(apt.start_time);
      return aptDate >= startOfPrevMonth && aptDate <= endOfPrevMonth;
    });

    // Calculate growth
    const monthlyConsultationsGrowth =
      prevMonthAppointments.length > 0
        ? ((monthlyAppointments.length - prevMonthAppointments.length) /
            prevMonthAppointments.length) *
          100
        : 0;

    // Get unique patients this month (new patients)
    const uniquePatients = new Set(
      monthlyAppointments.map((apt) => apt.patient_id)
    );
    const prevMonthUniquePatients = new Set(
      prevMonthAppointments.map((apt) => apt.patient_id)
    );

    const newPatientsGrowth =
      prevMonthUniquePatients.size > 0
        ? ((uniquePatients.size - prevMonthUniquePatients.size) /
            prevMonthUniquePatients.size) *
          100
        : 0;

    // Mock revenue calculation (you can implement actual pricing logic)
    const todayRevenue = todayAppointmentsCompleted * 150; // Assuming R$150 per consultation

    return {
      todayRevenue,
      todayAppointments: todayAppointments.length,
      todayAppointmentsCompleted,
      todayAppointmentsPending,
      monthlyConsultations: monthlyAppointments.length,
      monthlyConsultationsGrowth: Math.round(monthlyConsultationsGrowth),
      newPatientsThisMonth: uniquePatients.size,
      newPatientsGrowth: Math.round(newPatientsGrowth),
      satisfactionRate: 98, // Mock value - implement actual rating system
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

/**
 * Get monthly consultation statistics for the last 5 months
 */
export const getMonthlyConsultations = async (): Promise<
  MonthlyConsultation[]
> => {
  try {
    const appointments = await api.get<Appointment[]>(
      "/appointments/my-appointments"
    );
    const allAppointments = appointments.data;

    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const today = new Date();
    const monthlyData: MonthlyConsultation[] = [];

    // Get last 5 months
    for (let i = 4; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonthDate = new Date(
        today.getFullYear(),
        today.getMonth() - i + 1,
        1
      );

      const monthAppointments = allAppointments.filter((apt) => {
        const aptDate = new Date(apt.start_time);
        return aptDate >= monthDate && aptDate < nextMonthDate;
      });

      // Get unique patients for this month
      const uniquePatients = new Set(
        monthAppointments.map((apt) => apt.patient_id)
      );

      // Get patients from previous months to determine new patients
      const prevMonthDate = new Date(
        today.getFullYear(),
        today.getMonth() - i - 1,
        1
      );
      const prevAppointments = allAppointments.filter((apt) => {
        const aptDate = new Date(apt.start_time);
        return aptDate < monthDate;
      });
      const prevPatients = new Set(
        prevAppointments.map((apt) => apt.patient_id)
      );

      // Count new patients (patients who didn't have appointments before)
      const newPatients = Array.from(uniquePatients).filter(
        (patientId) => !prevPatients.has(patientId)
      ).length;

      monthlyData.push({
        month: monthNames[monthDate.getMonth()],
        consultas: monthAppointments.length,
        novas: newPatients,
      });
    }

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly consultations:", error);
    throw error;
  }
};

/**
 * Get recent patients for the professional
 */
export const getRecentPatients = async (
  limit: number = 10
): Promise<PatientSummary[]> => {
  try {
    const appointments = await api.get<Appointment[]>(
      "/appointments/my-appointments"
    );
    const allAppointments = appointments.data;

    // Group appointments by patient
    const patientMap = new Map<number, Appointment[]>();
    allAppointments.forEach((apt) => {
      if (!patientMap.has(apt.patient_id)) {
        patientMap.set(apt.patient_id, []);
      }
      patientMap.get(apt.patient_id)!.push(apt);
    });

    const patients: PatientSummary[] = [];
    const now = new Date();

    patientMap.forEach((appointments, patientId) => {
      // Sort appointments by date
      const sortedAppointments = appointments.sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );

      // Get last appointment
      const lastAppointment = sortedAppointments[0];

      // Get next appointment (future appointments)
      const futureAppointments = sortedAppointments
        .filter(
          (apt) => new Date(apt.start_time) > now && apt.status !== "cancelled"
        )
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );

      const nextAppointment = futureAppointments[0];

      // Determine status
      let status: "Ativo" | "Pendente" | "Inativo" = "Inativo";
      if (nextAppointment) {
        status = nextAppointment.status === "pending" ? "Pendente" : "Ativo";
      } else if (
        lastAppointment &&
        new Date(lastAppointment.start_time) >
          new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      ) {
        status = "Ativo";
      }

      // Determine priority based on appointment frequency and recency
      let prioridade: "Alta" | "Média" | "Baixa" = "Baixa";
      if (appointments.length >= 5) {
        prioridade = "Alta";
      } else if (appointments.length >= 3) {
        prioridade = "Média";
      }

      // Get patient name from appointment
      const patientName =
        lastAppointment.patient_name || `Paciente ${patientId}`;

      // Only add patients that have both last and next consultation
      // For patients without next consultation, use a placeholder date
      patients.push({
        id: patientId,
        avatar: patientName.charAt(0).toUpperCase(),
        nome: patientName,
        idade: 0, // Age not available from appointments, set to 0 as placeholder
        ultimaConsulta: lastAppointment?.start_time || new Date().toISOString(),
        proximaConsulta:
          nextAppointment?.start_time ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now as placeholder
        status,
        prioridade,
        profile_image_url: lastAppointment?.patient_image_url,
      });
    });

    // Sort by last consultation date (most recent first)
    patients.sort((a, b) => {
      const dateA = a.ultimaConsulta ? new Date(a.ultimaConsulta).getTime() : 0;
      const dateB = b.ultimaConsulta ? new Date(b.ultimaConsulta).getTime() : 0;
      return dateB - dateA;
    });

    return patients.slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent patients:", error);
    throw error;
  }
};

/**
 * Get all patients for the professional
 */
export const getAllPatients = async (): Promise<PatientSummary[]> => {
  try {
    return await getRecentPatients(1000); // Get all patients
  } catch (error) {
    console.error("Error fetching all patients:", error);
    throw error;
  }
};
