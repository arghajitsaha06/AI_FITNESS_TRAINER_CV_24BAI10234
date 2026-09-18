import React from "react";
import ExerciseCard from "./ExerciseCard";
import { mockExercises } from "../../data/mockData";

export const ExerciseGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockExercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
};

export default ExerciseGrid;
