import React from "react";

const PollResults = ({ poll }) => {
  // Guard clause for empty poll data
  if (!poll || !poll.question || !poll.responses) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No poll results available</p>
      </div>
    );
  }

  // Calculate total votes from all responses
  const totalVotes = Object.values(poll.responses).reduce((sum, count) => sum + count, 0);
  
  // Sort responses by count in descending order
  const sortedResponses = Object.entries(poll.responses)
    .sort((a, b) => b[1] - a[1]);

  // Calculate the highest vote count for highlighting the leading answer
  const highestVoteCount = sortedResponses.length > 0 ? sortedResponses[0][1] : 0;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Poll Results: {poll.question}</h3>
      <div className="text-sm text-gray-600 mb-3">
        Total votes: {totalVotes} {poll.duration && <span className="ml-2 text-blue-500">({poll.duration}s poll)</span>}
      </div>
      
      {sortedResponses.length > 0 ? (
        <div className="space-y-2">
          {sortedResponses.map(([answer, count], index) => {
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isLeading = count === highestVoteCount && totalVotes > 0;
            
            return (
              <div 
                key={index} 
                className={`bg-gray-600 border rounded-lg p-3 ${isLeading ? 'border-gray-400' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium ${isLeading ? 'text-white' : ''}`}>
                    {answer}
                    {isLeading && totalVotes > 1 && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Leading</span>}
                  </span>
                  <span className="text-sm text-gray-300">{count} vote{count !== 1 ? 's' : ''} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`${isLeading ? 'bg-blue-500' : 'bg-blue-400'} h-2.5 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-4 bg-gray-700 rounded-lg">
          <p className="text-gray-300">No responses yet</p>
        </div>
      )}
    </div>
  );
};

export default PollResults;