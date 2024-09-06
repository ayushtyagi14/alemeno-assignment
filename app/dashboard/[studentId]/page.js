"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/navbar';
import { useRouter } from 'next/navigation';

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Dashboard = ({ params }) => {
  const router = useRouter()
  const id = params.studentId;
  const [enrollments, setEnrollments] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentId = id;

  useEffect(() => {
    fetchStudentDetailsAndEnrollments();
  }, []);

  // Fetch the student details and their enrolled courses
  const fetchStudentDetailsAndEnrollments = async () => {
    setLoading(true);

    try {
      // Check if the student exists in the 'students' table
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single(); // Since we expect only one student

      if (studentError || !studentData) {
        console.error('Error fetching student:', studentError);
        setLoading(false);
        return;
      }

      setStudent(studentData);

      // Fetch enrollments for the student
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('students_id', studentId);

      if (enrollmentsError || enrollmentsData.length === 0) {
        console.error('Error fetching enrollments or no enrollments found:', enrollmentsError);
        setLoading(false);
        return;
      }

      console.log("Enrollment data", enrollmentsData)

      // Fetch the course details for each enrollment
      const coursesPromises = enrollmentsData.map(async (enrollment) => {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', enrollment.course_id)
          .single(); // Expect one course per course_id

        if (courseError || !courseData) {
          console.error('Error fetching course:', courseError);
          return null;
        }

        return {
          ...enrollment,
          course: courseData
        };
      });

      const coursesWithEnrollments = await Promise.all(coursesPromises);
      setEnrollments(coursesWithEnrollments.filter(Boolean)); // Filter out any null values

    } catch (error) {
      console.error('Unexpected error:', error);
    }

    setLoading(false);
  };

  const markAsCompleted = async (enrollmentId) => {
    const { error } = await supabase
      .from('enrollments')
      .update({ completed: true })
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error marking course as completed:', error);
    } else {
      fetchStudentDetailsAndEnrollments(); // Refresh enrollments
    }
  };

  if (loading) return <p className='flex justify-center items-center w-full h-screen text-[24px]'>Loading your courses...</p>;

  return (
    <>
      <Navbar />
      <div className="container max-w-screen-xl px-8 mx-auto py-8">
        {student && (
          <div className='flex flex-row gap-4 items-center mb-6 justify-center'>
            <img src={student.avatar} alt={student.name} className='w-[100px] h-[100px] rounded-full' />
            <div>
              <h1 className="text-3xl font-bold">Welcome, {student.name}</h1>
              <p className="text-gray-600">Email: <b> {student.email} </b></p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Your Enrolled Courses</h2>

        {enrollments.length === 0 ? (
          <p>No courses enrolled yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment, idx) => (
              <div
                key={idx}
                className="border p-4 rounded-lg shadow-md cursor-pointer"
                onClick={() => router.push(`/courses/${enrollment.course.id}`)}
              >
                <img
                  src={enrollment.course.thumbnail}
                  alt={enrollment.course.name}
                  className="mb-4 h-40 w-full object-cover rounded-md"
                />
                <h2 className="text-xl font-semibold">{enrollment.course.name}</h2>
                <p className="text-sm text-gray-600">{enrollment.course.instructor}</p>
                <p>Progress: {enrollment.progress}%</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsCompleted(enrollment.id)
                  }}
                  className={`mt-4 px-4 py-2 rounded-md ${enrollment.completed ? 'bg-green-500' : 'bg-blue-500'} text-white`}
                  disabled={enrollment.completed}
                >
                  {enrollment.completed ? 'Completed' : 'Mark as Completed'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
