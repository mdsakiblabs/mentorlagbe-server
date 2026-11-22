import "dotenv/config";
import { ObjectId } from "mongodb";
import { connectDB, getDB, client } from "../config/db.js";

const tutors = [
  {
    id: "674000000000000000000001",
    name: "Farhan Ahmed",
    email: "seed.tutor01@mentorlagbe.demo",
  },
  {
    id: "674000000000000000000002",
    name: "Nusrat Jahan",
    email: "seed.tutor02@mentorlagbe.demo",
  },
  {
    id: "674000000000000000000003",
    name: "Mahmud Hasan",
    email: "seed.tutor03@mentorlagbe.demo",
  },
  {
    id: "674000000000000000000004",
    name: "Tanjim Rahman",
    email: "seed.tutor04@mentorlagbe.demo",
  },
];

const students = [
  {
    name: "Ayesha Rahman",
    email: "seed.student01@mentorlagbe.demo",
    phone: "01700000001",
  },
  {
    name: "Sabbir Hossain",
    email: "seed.student02@mentorlagbe.demo",
    phone: "01700000002",
  },
  {
    name: "Maliha Islam",
    email: "seed.student03@mentorlagbe.demo",
    phone: "01700000003",
  },
  {
    name: "Rafi Ahmed",
    email: "seed.student04@mentorlagbe.demo",
    phone: "01700000004",
  },
  {
    name: "Sumaiya Akter",
    email: "seed.student05@mentorlagbe.demo",
    phone: "01700000005",
  },
  {
    name: "Nabil Hasan",
    email: "seed.student06@mentorlagbe.demo",
    phone: "01700000006",
  },
];

const tuitions = [
  {
    id: "672000000000000000000001",
    title: "Experienced Mathematics Tutor for Class 8-10",
    subject: "Mathematics",
    classLevel: "Class 8-10",
    mode: "Offline",
    location: "Dhanmondi, Dhaka",
    monthlyFee: 4000,
    daysPerWeek: 4,
    tutor: 0,
    description:
      "Looking for a dedicated mathematics tutor for school students. Lessons will focus on building strong fundamentals, solving problems, and preparing for examinations.",
  },
  {
    id: "672000000000000000000002",
    title: "Physics and Higher Mathematics Tutor",
    subject: "Physics",
    classLevel: "HSC",
    mode: "Online",
    location: "",
    monthlyFee: 5000,
    daysPerWeek: 4,
    tutor: 0,
    description:
      "HSC students will receive structured lessons in Physics with emphasis on conceptual clarity, mathematical problem solving, and board examination preparation.",
  },
  {
    id: "672000000000000000000003",
    title: "English Version Science Tutor",
    subject: "Science",
    classLevel: "Class 6-8",
    mode: "Offline",
    location: "Uttara, Dhaka",
    monthlyFee: 3500,
    daysPerWeek: 3,
    tutor: 0,
    description:
      "Seeking a patient tutor for English Version science subjects. Regular practice, chapter-wise explanations, and monthly assessments are included.",
  },
  {
    id: "672000000000000000000004",
    title: "Bangla and English Private Tutor",
    subject: "English",
    classLevel: "Class 5",
    mode: "Offline",
    location: "Khulna Sadar, Khulna",
    monthlyFee: 3000,
    daysPerWeek: 5,
    tutor: 1,
    description:
      "A caring tutor is needed to improve reading, writing, grammar, and communication skills through regular lessons and guided practice.",
  },
  {
    id: "672000000000000000000005",
    title: "HSC Chemistry Tutor",
    subject: "Chemistry",
    classLevel: "HSC",
    mode: "Online",
    location: "",
    monthlyFee: 4500,
    daysPerWeek: 3,
    tutor: 1,
    description:
      "Detailed HSC Chemistry lessons covering organic, inorganic, and physical chemistry with problem-solving sessions and exam-focused guidance.",
  },
  {
    id: "672000000000000000000006",
    title: "ICT and Computer Studies Tutor",
    subject: "ICT",
    classLevel: "Class 9-10",
    mode: "Offline",
    location: "Mirpur, Dhaka",
    monthlyFee: 3500,
    daysPerWeek: 3,
    tutor: 1,
    description:
      "Students will learn ICT concepts, practical computer knowledge, basic programming, and important examination topics in an easy-to-understand way.",
  },
  {
    id: "672000000000000000000007",
    title: "Primary Level All Subjects Tutor",
    subject: "All Subjects",
    classLevel: "Class 3-5",
    mode: "Offline",
    location: "Sonadanga, Khulna",
    monthlyFee: 2800,
    daysPerWeek: 5,
    tutor: 2,
    description:
      "Looking for an experienced primary-level tutor to support daily studies, homework, reading habits, and preparation for school examinations.",
  },
  {
    id: "672000000000000000000008",
    title: "Biology Tutor for HSC Students",
    subject: "Biology",
    classLevel: "HSC",
    mode: "Online",
    location: "",
    monthlyFee: 4000,
    daysPerWeek: 4,
    tutor: 2,
    description:
      "Comprehensive Biology lessons for HSC students, including diagrams, important terminology, chapter reviews, and model test preparation.",
  },
  {
    id: "672000000000000000000009",
    title: "Accounting Tutor for Class 11-12",
    subject: "Accounting",
    classLevel: "HSC",
    mode: "Offline",
    location: "Agrabad, Chattogram",
    monthlyFee: 4500,
    daysPerWeek: 4,
    tutor: 3,
    description:
      "An experienced accounting tutor will guide students through accounting principles, practical problems, financial statements, and board examination techniques.",
  },
  {
    id: "672000000000000000000010",
    title: "General Mathematics Tutor for Class 6-8",
    subject: "Mathematics",
    classLevel: "Class 6-8",
    mode: "Online",
    location: "",
    monthlyFee: 3200,
    daysPerWeek: 3,
    tutor: 3,
    description:
      "Online mathematics support for middle-school students with step-by-step explanations, regular practice problems, and progress tracking.",
  },
];

const applicationData = [
  {
    tuition: 0,
    student: 0,
    schedule: "Sunday, Tuesday and Thursday — 5:00 PM",
    note: "I would prefer evening classes.",
    status: "pending",
  },
  {
    tuition: 0,
    student: 1,
    schedule: "Saturday to Wednesday — 6:00 PM",
    note: "Please focus on board examination preparation.",
    status: "accepted",
  },
  {
    tuition: 1,
    student: 2,
    schedule: "Friday and Saturday — 10:00 AM",
    note: "I need help with numerical problems.",
    status: "accepted",
  },
  {
    tuition: 2,
    student: 3,
    schedule: "Sunday, Tuesday and Thursday — 4:00 PM",
    note: "English Version curriculum preferred.",
    status: "pending",
  },
  {
    tuition: 3,
    student: 4,
    schedule: "Saturday to Wednesday — 7:00 PM",
    note: "I want to improve grammar and writing.",
    status: "rejected",
  },
  {
    tuition: 4,
    student: 5,
    schedule: "Monday, Wednesday and Friday — 6:00 PM",
    note: "Online classes work best for me.",
    status: "pending",
  },
  {
    tuition: 5,
    student: 0,
    schedule: "Sunday, Tuesday and Thursday — 7:00 PM",
    note: "Interested in practical computer lessons.",
    status: "accepted",
  },
  {
    tuition: 6,
    student: 1,
    schedule: "Saturday to Wednesday — 4:00 PM",
    note: "Need support with all primary subjects.",
    status: "pending",
  },
  {
    tuition: 7,
    student: 2,
    schedule: "Friday to Monday — 8:00 PM",
    note: "Please include regular model tests.",
    status: "rejected",
  },
  {
    tuition: 8,
    student: 3,
    schedule: "Sunday, Tuesday and Thursday — 6:00 PM",
    note: "I need help with accounting problems.",
    status: "accepted",
  },
  {
    tuition: 9,
    student: 4,
    schedule: "Saturday, Monday and Wednesday — 5:00 PM",
    note: "I prefer interactive online lessons.",
    status: "pending",
  },
  {
    tuition: 9,
    student: 5,
    schedule: "Sunday, Tuesday and Thursday — 8:00 PM",
    note: "I need help preparing for school exams.",
    status: "rejected",
  },
];

const runSeed = async () => {
  await connectDB();
  const db = getDB();

  const users = db.collection("users");
  const tuitionCollection = db.collection("tuitions");
  const applications = db.collection("applications");

  const timestamp = new Date();

  for (const tutor of tutors) {
    await users.updateOne(
      { email: tutor.email },
      {
        $set: {
          name: tutor.name,
          email: tutor.email,
          emailVerified: false,
          role: "tutor",
          plan: "pro",
          updatedAt: timestamp,
        },
        $setOnInsert: {
          _id: new ObjectId(tutor.id),
          createdAt: timestamp,
        },
      },
      { upsert: true },
    );
  }

  for (const student of students) {
    await users.updateOne(
      { email: student.email },
      {
        $set: {
          name: student.name,
          email: student.email,
          emailVerified: false,
          role: "student",
          plan: "free",
          phone: student.phone,
          updatedAt: timestamp,
        },
        $setOnInsert: {
          _id: new ObjectId(
            `67500000000000000000000${students.indexOf(student) + 1}`,
          ),
          createdAt: timestamp,
        },
      },
      { upsert: true },
    );
  }

  for (let i = 0; i < tuitions.length; i++) {
    const tuition = tuitions[i];
    const tutor = tutors[tuition.tutor];

    await tuitionCollection.updateOne(
      { _id: new ObjectId(tuition.id) },
      {
        $set: {
          title: tuition.title,
          subject: tuition.subject,
          classLevel: tuition.classLevel,
          mode: tuition.mode,
          location: tuition.location,
          monthlyFee: tuition.monthlyFee,
          daysPerWeek: tuition.daysPerWeek,
          bannerImage: "",
          description: tuition.description,
          tutorName: tutor.name,
          tutorEmail: tutor.email,
          approvalStatus: "approved",
          isActive: true,
          updatedAt: timestamp,
        },
        $setOnInsert: {
          createdAt: new Date(
            timestamp.getTime() - (tuitions.length - i) * 86400000,
          ),
        },
      },
      { upsert: true },
    );
  }

  for (let i = 0; i < applicationData.length; i++) {
    const item = applicationData[i];
    const tuition = tuitions[item.tuition];
    const tutor = tutors[tuition.tutor];
    const student = students[item.student];

    await applications.updateOne(
      {
        _id: new ObjectId(
          `6730000000000000000000${String(i + 1).padStart(2, "0")}`,
        ),
      },
      {
        $set: {
          tuitionId: new ObjectId(tuition.id),
          tuitionTitle: tuition.title,
          subject: tuition.subject,
          monthlyFee: tuition.monthlyFee,
          tutorEmail: tutor.email,
          studentName: student.name,
          studentEmail: student.email,
          studentPhone: student.phone,
          preferredSchedule: item.schedule,
          studentNote: item.note,
          status: item.status,
          updatedAt: timestamp,
        },
        $setOnInsert: {
          appliedAt: new Date(
            timestamp.getTime() - (applicationData.length - i) * 3600000,
          ),
        },
      },
      { upsert: true },
    );
  }

  const [userCount, tuitionCount, applicationCount, approvedCount] =
    await Promise.all([
      users.countDocuments(),
      tuitionCollection.countDocuments(),
      applications.countDocuments(),
      tuitionCollection.countDocuments({
        approvalStatus: "approved",
        isActive: true,
      }),
    ]);

  console.log("\nSeed completed successfully.");
  console.log("Total users:", userCount);
  console.log("Total tuitions:", tuitionCount);
  console.log("Approved and active tuitions:", approvedCount);
  console.log("Total applications:", applicationCount);
};

runSeed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
