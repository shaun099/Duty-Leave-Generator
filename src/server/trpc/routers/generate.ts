import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export const generateRouter = router({
  generateLetter: publicProcedure
    .input(
      z.object({
        template: z.string(), // base64 docx
        from: z.string(),
        to: z.string(),
        eventName: z.string(),
        venue: z.string(),
        date: z.string(),
        time: z.string(),
        students: z.array(
          z.object({
            sl: z.number(),
            name: z.string(),
            regno: z.string(),
            dept: z.string(),
            year: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const templateBuffer = Buffer.from(input.template, "base64");

      const zip = new PizZip(templateBuffer);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const now = new Date();
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const currentDate = `${String(now.getDate()).padStart(2, "0")} ${months[now.getMonth()]} ${now.getFullYear()}`;

      doc.setData({
        from: input.from,
        to: input.to,
        event_name: input.eventName,
        venue: input.venue,
        date: currentDate,
        time: input.time,
        students: input.students,
      });

      doc.render();

      const buffer = doc.getZip().generate({
        type: "nodebuffer",
      });

      return {
        file: buffer.toString("base64"),
      };
    }),
});
