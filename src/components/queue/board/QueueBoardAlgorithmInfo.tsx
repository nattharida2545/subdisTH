import React from "react";

interface QueueBoardAlgorithmInfoProps {
  algorithmName: string;
}

const QueueBoardAlgorithmInfo: React.FC<QueueBoardAlgorithmInfoProps> = ({
  algorithmName,
}) => {
  return (
    <div className="bg-white shadow-md py-2">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm text-gray-600">
          <span className="font-semibold">{algorithmName}</span>
        </p>
      </div>
    </div>
  );
};

export default QueueBoardAlgorithmInfo;
