import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalContext } from '@/app/context/store';

const Navbar = () => {
    const { currentStudent, students, changeStudent } = useGlobalContext(); // Access global context
    const [dropdownOpen, setDropdownOpen] = useState(false); // Manage dropdown state
    const router = useRouter(); // To navigate to different pages

    // Function to handle student switch
    const handleStudentChange = (studentId) => {
        changeStudent(studentId); // Change the current student
        setDropdownOpen(false); // Close the dropdown after selecting
    };

    // Navigate to dashboard with student ID in the query
    const goToDashboard = () => {
        if (currentStudent) {
            router.push(`/dashboard/${currentStudent.id}`); // Pass current student ID
        }
    };

    return (
        <nav className="flex justify-between items-center bg-gray-800 py-4 px-10 text-white">
            <div className="text-[22px] font-bold cursor-pointer" onClick={() => router.push('/')}>Alemeno</div>

            {/* Dashboard Button and Avatar */}
            <div className="flex items-center space-x-4">
                {/* Dashboard Button */}
                <button
                    onClick={goToDashboard}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                    Dashboard
                </button>

                {/* Avatar Button */}
                <div className="relative">
                    <button
                        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-full"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        {/* Display current student's avatar */}
                        {currentStudent && (
                            <img
                                src={currentStudent.avatar}
                                alt={currentStudent.name}
                                className="w-8 h-8 rounded-full"
                            />
                        )}
                    </button>

                    {/* Dropdown for switching students */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-10">
                            {students.map((student) => (
                                <button
                                    key={student.id}
                                    onClick={() => handleStudentChange(student.id)}
                                    className="block px-4 py-2 hover:bg-gray-100 w-full rounded-lg text-left"
                                >
                                    {student.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
