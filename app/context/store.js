"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Create GlobalContext
const GlobalContext = createContext({});

export const GlobalContextProvider = ({ children }) => {
    const [students, setStudents] = useState([]); // List of all students
    const [currentStudent, setCurrentStudent] = useState(null); // Current student selected

    // Fetch students from Supabase
    useEffect(() => {
        const fetchStudents = async () => {
            const { data, error } = await supabase
                .from('students')
                .select('*');

            if (error) {
                console.error('Error fetching students:', error);
            } else {
                setStudents(data);
                // Set the first student as the default
                if (data.length > 0) {
                    setCurrentStudent(data[0]);
                }
            }
        };

        fetchStudents();
    }, []);

    // Function to change the current student
    const changeStudent = (studentId) => {
        const selectedStudent = students.find(student => student.id === studentId);
        if (selectedStudent) {
            setCurrentStudent(selectedStudent);
        }
    };

    return (
        <GlobalContext.Provider value={{ students, currentStudent, changeStudent }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Custom hook to use GlobalContext
export const useGlobalContext = () => useContext(GlobalContext);
