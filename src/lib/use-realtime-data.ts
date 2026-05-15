import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface EventData {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime?: string;
  is_all_day: boolean;
  status: string;
}

export interface TransactionData {
  id: string;
  type: string;
  amount: number;
  category: string;
  date: string;
}

export interface ClientData {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface JobData {
  id: string;
  title: string;
  client_id?: string;
  status: string;
}

export function useRealtimeEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const loadInitial = async () => {
      const { data, error: err } = await supabase
        .from("events")
        .select("*")
        .order("start_datetime", { ascending: true });
      if (err) {
        setError(err.message);
      } else {
        setEvents((data as EventData[]) || []);
      }
      setLoading(false);
    };

    loadInitial();

    const channel = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setEvents((prev) => [...prev, payload.new as EventData]);
          } else if (payload.eventType === "UPDATE") {
            setEvents((prev) =>
              prev.map((e) => (e.id === (payload.new as EventData).id ? (payload.new as EventData) : e))
            );
          } else if (payload.eventType === "DELETE") {
            setEvents((prev) => prev.filter((e) => e.id !== (payload.old as EventData).id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { events, loading, error };
}

export function useRealtimeTransactions() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const loadInitial = async () => {
      const { data, error: err } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });
      if (err) {
        setError(err.message);
      } else {
        setTransactions((data as TransactionData[]) || []);
      }
      setLoading(false);
    };

    loadInitial();

    const channel = supabase
      .channel("public:transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setTransactions((prev) => [...prev, payload.new as TransactionData]);
          } else if (payload.eventType === "UPDATE") {
            setTransactions((prev) =>
              prev.map((t) => (t.id === (payload.new as TransactionData).id ? (payload.new as TransactionData) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTransactions((prev) => prev.filter((t) => t.id !== (payload.old as TransactionData).id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { transactions, loading, error };
}

export function useRealtimeClients() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const loadInitial = async () => {
      const { data, error: err } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) {
        setError(err.message);
      } else {
        setClients((data as ClientData[]) || []);
      }
      setLoading(false);
    };

    loadInitial();

    const channel = supabase
      .channel("public:clients")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setClients((prev) => [...prev, payload.new as ClientData]);
          } else if (payload.eventType === "UPDATE") {
            setClients((prev) =>
              prev.map((c) => (c.id === (payload.new as ClientData).id ? (payload.new as ClientData) : c))
            );
          } else if (payload.eventType === "DELETE") {
            setClients((prev) => prev.filter((c) => c.id !== (payload.old as ClientData).id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { clients, loading, error };
}

export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const loadInitial = async () => {
      const { data, error: err } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) {
        setError(err.message);
      } else {
        setJobs((data as JobData[]) || []);
      }
      setLoading(false);
    };

    loadInitial();

    const channel = supabase
      .channel("public:jobs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setJobs((prev) => [...prev, payload.new as JobData]);
          } else if (payload.eventType === "UPDATE") {
            setJobs((prev) =>
              prev.map((j) => (j.id === (payload.new as JobData).id ? (payload.new as JobData) : j))
            );
          } else if (payload.eventType === "DELETE") {
            setJobs((prev) => prev.filter((j) => j.id !== (payload.old as JobData).id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { jobs, loading, error };
}
