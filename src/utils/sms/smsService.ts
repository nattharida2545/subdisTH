import { supabase } from "@/integrations/supabase/client";
import {
  Queue,
  ServicePoint,
  Patient,
  QueueIns,
  ServicePointIns,
} from "@/integrations/supabase/schema";
import { createLogger } from "@/utils/logger";
import { getMessageTemplate, getMessageTemplateIns } from "./smsSettings";
import { formatQueueNumber } from "@/utils/queueFormatters";
import { formatQueueInsNumber } from "@/utils/queueInsFormatters";

const logger = createLogger("smsService");

export const sendSmsToPatient = async (
  patient: Patient,
  queue: Queue,
  servicePoint?: ServicePoint
): Promise<boolean> => {
  try {
    if (!patient?.phone) {
      logger.warn(
        `No phone number for patient ${patient?.name} (Queue ${queue.number})`
      );
      return false;
    }
    console.log("run sendSmsToPatient");
    // Format the queue number properly (A001, E007, etc.)
    const formattedQueueNumber = formatQueueNumber(
      queue.type as any,
      queue.number
    );

    // Get message template from settings
    const messageTemplate = await getMessageTemplate();
    const message = messageTemplate
      ? messageTemplate
          .replace("{queueNumber}", formattedQueueNumber)
          .replace("{servicePoint}", servicePoint?.name || "")
      : `ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข ${formattedQueueNumber}${
          servicePoint?.name ? ` ที่ช่องบริการ ${servicePoint.name}` : ""
        } `;

    const { data, error } = await supabase.functions.invoke(
      "send-sms-notification",
      {
        body: {
          phoneNumber: patient?.phone,
          message,
          queueNumber: formattedQueueNumber,
          patientName: patient?.name,
          servicePointName: servicePoint?.name,
        },
      }
    );

    if (error) {
      logger.error(`SMS error for queue ${formattedQueueNumber}:`, error);
      return false;
    }

    logger.info(
      `SMS sent successfully to queue ${formattedQueueNumber} (${patient?.name})`
    );

    // Update notification timestamp on the queue
    const { error: updateError } = await supabase
      .from("queues")
      .update({ noti_at: new Date().toISOString() })
      .eq("id", queue.id);

    if (updateError) {
      logger.error(
        `Failed to update noti_at for queue ${formattedQueueNumber} (id=${queue.id}):`,
        updateError
      );
    } else {
      logger.info(
        `Updated noti_at for queue ${formattedQueueNumber} (id=${queue.id})`
      );
    }

    return true;
  } catch (error) {
    logger.error(`Error sending SMS to patient ${patient?.name}:`, error);
    return false;
  }
};

// INS-specific sender using phone from QueueIns and updating queues_ins
export const sendSmsToInsQueue = async (
  queue: QueueIns,
  servicePoint?: ServicePointIns
): Promise<boolean> => {
  try {
    const phone = queue.phone_number;
    if (!phone) {
      logger.warn(`No phone number for INS queue ${queue.number}`);
      return false;
    }

    // Format number like I001 etc, based on type config
    const formattedQueueNumber = formatQueueInsNumber(queue.type, queue.number);
    const messageTemplate = await getMessageTemplateIns();

    // Get message template
    // const messageTemplate = await getMessageTemplate();
    const message = messageTemplate
      ? messageTemplate
          .replace("{queueNumber}", formattedQueueNumber)
          .replace("{servicePoint}", servicePoint?.name || "")
      : `ท่านกำลังจะได้รับบริการตรวจในคิวถัดไป คิวหมายเลข ${formattedQueueNumber}${
          servicePoint?.name ? ` ที่ช่องบริการ ${servicePoint.name}` : ""
        } `;

    const { error } = await supabase.functions.invoke("send-sms-notification", {
      body: {
        phoneNumber: phone,
        message,
        queueNumber: formattedQueueNumber,
        patientName: undefined,
        servicePointName: servicePoint?.name,
      },
    });

    if (error) {
      logger.error(`SMS error for INS queue ${formattedQueueNumber}:`, error);
      return false;
    }

    logger.info(`SMS sent successfully to INS queue ${formattedQueueNumber}`);

    // Update notification timestamp on the INS queue
    const { error: updateError } = await supabase
      .from("queues_ins")
      .update({ noti_at: new Date().toISOString() })
      .eq("id", queue.id);

    if (updateError) {
      logger.error(
        `Failed to update noti_at for INS queue ${formattedQueueNumber} (id=${queue.id}):`,
        updateError
      );
    } else {
      logger.info(
        `Updated noti_at for INS queue ${formattedQueueNumber} (id=${queue.id})`
      );
    }

    return true;
  } catch (error) {
    logger.error(`Error sending SMS for INS queue ${queue.number}:`, error);
    return false;
  }
};
