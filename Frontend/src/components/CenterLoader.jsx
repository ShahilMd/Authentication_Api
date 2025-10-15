import React from 'react';

const CenterLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-30">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
}

export default CenterLoader;
