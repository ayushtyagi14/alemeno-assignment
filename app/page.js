"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { useGlobalContext } from './context/store';

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const CourseListing = () => {
  const [courses, setCourses] = useState([]);
  const [likes, setLikes] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentStudent } = useGlobalContext(); // Get current student from global context
  const router = useRouter(); // Hook to navigate between pages

  useEffect(() => {
    if (currentStudent) {
      fetchCourses();

      // Set up real-time subscription using Supabase channel
      const likesSubscription = supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'likes' },
          (payload) => {
            console.log('Change received!', payload);
            fetchCourses(); // Refetch courses when a like is added/updated
          }
        )
        .subscribe();

      return () => {
        // Unsubscribe on cleanup
        supabase.removeChannel(likesSubscription);
      };
    }
  }, [currentStudent]); // Re-fetch when currentStudent changes

  const fetchCourses = async () => {
    setLoading(true);

    // Fetch courses without counting likes
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, name, instructor, thumbnail');

    if (courseError) {
      console.error('Error fetching courses:', courseError);
      setLoading(false);
      return;
    }

    // Fetch likes separately for each course
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('course_id, user_id');

    if (likesError) {
      console.error('Error fetching likes:', likesError);
      setLoading(false);
      return;
    }

    // Create a mapping of course_id to like count and user_id array
    const likesMap = {};
    likesData.forEach((like) => {
      if (!likesMap[like.course_id]) {
        likesMap[like.course_id] = {
          count: 0,
          users: []
        };
      }
      likesMap[like.course_id].count += 1;
      likesMap[like.course_id].users.push(like.user_id);
    });

    setCourses(courseData);
    setLikes(likesMap);

    setLoading(false);
  };

  const handleLikeToggle = async (courseId, isLiked) => {
    if (isLiked) {
      // If already liked, delete the like
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ course_id: courseId, user_id: currentStudent.id });

      if (error) {
        console.error('Error unliking course:', error);
      } else {
        console.log('Course unliked!');
      }
    } else {
      // If not liked, insert a new like
      const { error } = await supabase
        .from('likes')
        .insert([{ course_id: courseId, user_id: currentStudent.id }]);

      if (error) {
        console.error('Error liking course:', error);
      } else {
        console.log('Course liked!');
      }
    }

    // Refetch courses to update the UI
    fetchCourses();
  };

  const isCourseLikedByUser = (courseId) => {
    return likes[courseId] && likes[courseId].users.includes(currentStudent.id);
  };

  if (loading) return <p className='flex justify-center items-center w-full h-screen text-[24px]'>Loading courses...</p>;

  return (
    <>
      <Navbar />
      <div className="container max-w-screen-xl px-8 mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Available Courses</h1>

        {courses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isLiked = isCourseLikedByUser(course.id);
              const likeCount = likes[course.id]?.count || 0;

              return (
                <div
                  key={course.id}
                  className="border p-4 rounded-lg shadow-md cursor-pointer"
                  onClick={() => router.push(`/courses/${course.id}`)} // Navigate to course detail page
                >
                  <img
                    src={course.thumbnail}
                    alt={course.name}
                    className="mb-4 h-40 w-full object-cover rounded-md"
                  />
                  <h2 className="text-xl font-semibold">{course.name}</h2>
                  <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                  <p className="mt-2">Likes: {likeCount}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigating to details page on button click
                      handleLikeToggle(course.id, isLiked);
                    }}
                    className={`mt-4 px-4 py-2 ${
                      isLiked ? 'bg-red-500' : 'bg-blue-500'
                    } text-white rounded-md`}
                  >
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default CourseListing;
