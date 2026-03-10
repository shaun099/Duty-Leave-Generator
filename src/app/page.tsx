"use client";

import { useState } from "react";
import Papa from "papaparse";
import { trpc } from "@/utils/trpc";

type Student = {
  Name: string;
  Department: string;
  Batch: string;
  Year: string;
};

export default function Home() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [eventDetails, setEventDetails] = useState({
    from: "",
    to: "",
    eventName: "",
    venue: "",
    date: "",
    time: "",
  });

  const generateMutation = trpc.generate.generateLetter.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setEventDetails({
      ...eventDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setTemplateFile(e.target.files[0]);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Student>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setStudents(result.data);
      },
    });
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result?.toString().split(",")[1];
        resolve(base64 || "");
      };
      reader.onerror = reject;
    });

  const handleGenerate = async () => {
    if (!templateFile) {
      alert("Please upload a template file.");
      return;
    }

    if (students.length === 0) {
      alert("Please upload a student CSV.");
      return;
    }

    try {
      const templateBase64 = await fileToBase64(templateFile);

      const formattedStudents = students.map((s, i) => ({
        sl: i + 1,
        name: s.Name,
        dept: s.Department,
        batch: s.Batch,
        year: s.Year,
      }));

      const result = await generateMutation.mutateAsync({
        template: templateBase64,
        ...eventDetails,
        students: formattedStudents,
      });

      const link = document.createElement("a");
      link.href =
        "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," +
        result.file;
      link.download = "duty-leave-letter.docx";
      link.click();
    } catch (err) {
      console.error(err);
      alert("Error generating document");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 sm:p-10 text-black">
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Duty Leave Generator
          </h1>
          <p className="mt-1 text-sm text-black/70">
            Upload a template, fill in event details, and generate duty leave
            letters for students.
          </p>
        </div>

        {/* Template Upload */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-black">
            1. Upload Template
          </h2>
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-black/20 rounded-xl cursor-pointer hover:border-black/40 transition-colors">
            <div className="text-center">
              <p className="text-sm font-medium text-black">
                {templateFile
                  ? templateFile.name
                  : "Click to upload .docx template"}
              </p>
              {templateFile && (
                <p className="text-xs text-green-700 mt-1">File selected</p>
              )}
              {!templateFile && (
                <p className="text-xs text-black/50 mt-1">
                  Supports .doc and .docx files
                </p>
              )}
            </div>
            <input
              type="file"
              accept=".doc,.docx"
              onChange={handleTemplateUpload}
              className="hidden"
            />
          </label>
        </section>

        {/* Event Details */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-black">2. Event Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">
                From
              </label>
              <textarea
                name="from"
                rows={3}
                value={eventDetails.from}
                onChange={handleInputChange}
                className="border border-black/20 p-2.5 rounded-lg w-full text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">To</label>
              <textarea
                name="to"
                rows={3}
                placeholder="The Principal
St. Joseph's College of Engineering and Technology, Palai"
                value={eventDetails.to}
                onChange={handleInputChange}
                className="border border-black/20 p-2.5 rounded-lg w-full text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-sm font-medium text-black">
                Event Name
              </label>
              <input
                name="eventName"
                value={eventDetails.eventName}
                onChange={handleInputChange}
                className="border border-black/20 p-2.5 rounded-lg w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">
                Venue
              </label>
              <input
                name="venue"
                value={eventDetails.venue}
                onChange={handleInputChange}
                className="border border-black/20 p-2.5 rounded-lg w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={eventDetails.date}
                onChange={handleInputChange}
                className="border border-black/20 p-2.5 rounded-lg w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">
                Time
              </label>
              <input
                name="time"
                value={eventDetails.time}
                onChange={handleInputChange}
                className="border border-black/20 p-2.5 rounded-lg w-full"
              />
            </div>
          </div>
        </section>

        {/* CSV Upload */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-black">
            3. Upload Student List
          </h2>
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-black/20 rounded-xl cursor-pointer hover:border-black/40 transition-colors">
            <div className="text-center">
              <p className="text-sm font-medium text-black">
                {students.length > 0
                  ? `${students.length} student(s) loaded`
                  : "Click to upload .csv file"}
              </p>
              <p className="text-xs text-black/50 mt-1">
                CSV must have columns: Name, Department, Batch, Year
              </p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
          </label>
        </section>

        {students.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-black mb-3">
              Student Preview ({students.length})
            </h2>

            <div className="overflow-auto border border-black/10 rounded-xl">
              <table className="w-full text-sm text-black">
                <thead className="bg-black/5">
                  <tr>
                    <th className="p-3 border-b">Sl No</th>
                    <th className="p-3 border-b">Name</th>
                    <th className="p-3 border-b">Department</th>
                    <th className="p-3 border-b">Batch</th>
                    <th className="p-3 border-b">Year of Study</th>
                  </tr>
                </thead>

                <tbody>
                  {students.slice(0, 10).map((student, index) => (
                    <tr key={index}>
                      <td className="p-3 border-b">{index + 1}</td>
                      <td className="p-3 border-b">{student.Name}</td>
                      <td className="p-3 border-b">{student.Department}</td>
                      <td className="p-3 border-b">{student.Batch}</td>
                      <td className="p-3 border-b">{student.Year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length > 10 && (
                <p className="text-xs text-black/50 p-3 text-center">
                  Showing 10 of {students.length} students
                </p>
              )}
            </div>
          </section>
        )}

        <button
          onClick={handleGenerate}
          className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-black/85 transition-colors"
        >
          {generateMutation.isPending
            ? "Generating..."
            : "Generate Duty Leave Letter"}
        </button>
      </div>
    </div>
  );
}
