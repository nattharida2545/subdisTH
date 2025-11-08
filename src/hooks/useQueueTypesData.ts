import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueueType } from "@/hooks/useQueueTypes";
import { QueueTypeData } from "@/integrations/supabase/database.types";

export const useQueueTypesData = () => {
  const [queueTypes, setQueueTypes] = useState<QueueType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueueTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use any to work around type system limitations
      const { data, error } = await (supabase as any)
        .from("queue_types")
        .select("*")
        .order("priority", { ascending: false });

      const { data: queueTypesIns } = await (supabase as any)
        .from("queue_ins_types")
        .select("*");

      if (error) {
        throw error;
      }

      if (data) {
        // Transform DB data to match QueueType format
        const formattedData: QueueType[] = data.map((item: QueueTypeData) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          prefix: item.prefix,
          purpose: item.purpose || undefined,
          format: item.format as "0" | "00" | "000",
          enabled: item.enabled,
          algorithm: item.algorithm,
          priority: item.priority,
        }));

        // Add INS queue types if available
        if (queueTypesIns && queueTypesIns.length > 0) {
          const insFormattedData = queueTypesIns.map((item: any) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            prefix: item.prefix,
            purpose: "INS",
            format: item.format as "0" | "00" | "000",
            enabled: item.enabled,
            algorithm: item.algorithm,
            priority: item.priority,
          }));

          // Combine both queue types
          formattedData.push(...insFormattedData);
        }

        setQueueTypes(formattedData);

        // Save to localStorage as a fallback for offline access
        localStorage.setItem("queue_types", JSON.stringify(formattedData));

        console.log(`Fetched ${data.length} queue types from database`);
      } else {
        // If no queue types found, try to load from localStorage
        loadFromLocalStorage();
      }
    } catch (err: any) {
      console.error("Error fetching queue types:", err);
      setError(err.message || "Failed to fetch queue types");

      // Try to load from localStorage if network request fails
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedQueueTypes = localStorage.getItem("queue_types");

      if (savedQueueTypes) {
        setQueueTypes(JSON.parse(savedQueueTypes));
        toast.info("ใช้ข้อมูลประเภทคิวที่บันทึกไว้ในเครื่อง");
      }
    } catch (err) {
      console.error("Error loading queue types from localStorage:", err);
    }
  };

  const saveQueueType = async (queueType: QueueType) => {
    try {
      // Then save to Supabase, using any to bypass type checking
      const { data, error } = await (supabase as any)
        .from("queue_types")
        .upsert({
          id: queueType.id,
          code: queueType.code,
          name: queueType.name,
          prefix: queueType.prefix,
          purpose: queueType.purpose || null,
          format: queueType.format,
          enabled: queueType.enabled,
          algorithm: queueType.algorithm,
          priority: queueType.priority,
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Queue type saved successfully:", data);

      // Refresh queue types after successful save
      await fetchQueueTypes();
      return true;
    } catch (err: any) {
      console.error("Error saving queue type:", err);
      toast.error(
        `ไม่สามารถบันทึกประเภทคิว ${queueType.name} ได้: ${
          err.message || "Unknown error"
        }`
      );
      return false;
    }
  };

  const deleteQueueType = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("queue_types")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Queue type deleted successfully");

      // Refresh queue types after successful delete
      await fetchQueueTypes();
      return true;
    } catch (err: any) {
      console.error("Error deleting queue type:", err);
      toast.error(`ไม่สามารถลบประเภทคิวได้: ${err.message || "Unknown error"}`);
      return false;
    }
  };

  // Initial data fetch and set up real-time subscription
  useEffect(() => {
    fetchQueueTypes();

    // Set up real-time subscription for queue types changes
    const channel = (supabase as any)
      .channel("queue-types-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_types" },
        (payload: any) => {
          console.log("Queue types data change detected:", payload);
          fetchQueueTypes(); // Refresh queue types when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    queueTypes,
    loading,
    error,
    fetchQueueTypes,
    saveQueueType,
    deleteQueueType,
  };
};
