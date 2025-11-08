import { supabase } from "@/integrations/supabase/client";
import { QueueType } from "@/integrations/supabase/schema";

export const getQueueTypeLabel = (type: QueueType): string => {
  switch (type) {
    case "GENERAL":
      return "ทั่วไป";
    case "URGENT":
      return "ด่วน";
    case "ELDERLY":
      return "ผู้สูงอายุ";
    case "APPOINTMENT":
      return "นัดหมาย";
    default:
      return "ไม่ระบุ";
  }
};

export const getAllQueueTypes = async () => {
  const { data: queueTypes } = await supabase
    .from("queue_types")
    .select("code, name");

  const { data: queueTypesIns } = await supabase
    .from("queue_ins_types")
    .select("code, name");


  return queueTypes.concat(queueTypesIns);
};
