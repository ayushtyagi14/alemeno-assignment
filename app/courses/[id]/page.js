"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/navbar';

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const CourseDetails = ({ params }) => {
    const id = params.id; // Get the dynamic route parameter (course ID)
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedWeek, setExpandedWeek] = useState(null); // State to manage expanded week

    useEffect(() => {
        if (id) {
            fetchCourseDetails();
        }
    }, [id]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();

        if (error) {
            console.error('Error fetching course:', error);
        } else {
            setCourse(data);
        }
        setLoading(false);
    };

    const toggleWeek = (weekIndex) => {
        setExpandedWeek(expandedWeek === weekIndex ? null : weekIndex); // Toggle expanded state
    };

    if (loading) return <p className='flex justify-center items-center w-full h-screen text-[24px]'>Loading course details...</p>;

    return (
        <>
            <Navbar />
            <div className="container max-w-screen-lg px-8 mx-auto py-8">
                {course ? (
                    <div className="border p-6 rounded-lg shadow-md">
                        <img
                            src={course.thumbnail}
                            alt={course.name}
                            className="mb-4 h-60 w-full object-cover rounded-md"
                        />
                        <h1 className="text-4xl font-bold mb-4">{course.name}</h1>
                        <p className="text-lg text-gray-600 mb-4">{course.instructor}</p>
                        <p className="text-lg mb-4">{course.description}</p>
                        <p><strong>Status:</strong> {course.enrollment_status}</p>
                        <p><strong>Duration:</strong> {course.duration}</p>
                        <p><strong>Schedule:</strong> {course.schedule}</p>
                        <p><strong>Location:</strong> {course.location}</p>
                        <p><strong>Prerequisites:</strong> {course.prerequisites}</p>

                        <h2 className="text-2xl font-semibold mt-6">Syllabus</h2>
                        <ul className="list-disc ml-6">
                            {course.syllabus.map((week, index) => (
                                <li key={index} className="mb-2">
                                    <button
                                        onClick={() => toggleWeek(index)}
                                        className="text-lg font-semibold text-blue-600 hover:underline"
                                    >
                                        Week {week.week}: {week.topic}
                                    </button>
                                    {expandedWeek === index && (
                                        <div className="ml-4 mt-2">
                                            <p>{week.content}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className='flex justify-center items-center w-full h-screen text-[24px]'>Course not found.</p>
                )}
            </div>
        </>
    );
};

export default CourseDetails;
