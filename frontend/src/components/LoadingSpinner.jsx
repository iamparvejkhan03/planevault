// function LoadingSpinner({height}){
//     return (
//         <div style={{ minHeight: height }} className={`w-full flex justify-center items-center`}>
//             <div className="h-10 w-10 border-4 border-blue-100 border-b-blue-600 animate-spin rounded-full mx-auto mt-10"></div>
//         </div>
//     );
// }

// export default LoadingSpinner;

function LoadingSpinner({ height }) {
  return (
    <div
      style={{ minHeight: height }}
      className="w-full flex justify-center items-center"
    >
      <div className="relative h-24 w-24">
        {/* Aircraft Body - STATIC */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-20 bg-gray-800 rounded z-20"></div>

        {/* Spinning Propeller */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-20 w-20 animate-spin-slow">
          {/* Blade 1 */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-2 w-12 bg-black rounded-full"></div>
          {/* Blade 2 */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 h-2 w-12 bg-black rounded-full rotate-90"></div>
          {/* Blade 3 */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-2 w-12 bg-black rounded-full rotate-180"></div>
          {/* Blade 4 */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 h-2 w-12 bg-black rounded-full rotate-270"></div>
        </div>

        {/* Propeller Hub */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 bg-gray-900 rounded-full z-30 border-2 border-gray-700"></div>
      </div>
    </div>
  );
}

// components/LoadingSpinner.jsx

// function LoadingSpinner({ height }) {
//   return (
//     <div
//       style={{ minHeight: height }}
//       className="w-full flex justify-center items-center"
//     >
//       <div className="relative h-16 w-16 animate-spin-slow mx-auto mt-10">
//         {/* Blade 1 */}
//         <div className="absolute w-14 h-2 bg-black rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
//         {/* Blade 2 */}
//         <div className="absolute w-14 h-2 bg-black rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-120"></div>
//         {/* Blade 3 */}
//         <div className="absolute w-14 h-2 bg-black rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-240"></div>
//         {/* Center hub */}
//         <div className="absolute w-5 h-5 bg-gray-800 rounded-full border border-gray-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
//       </div>
//     </div>
//   );
// }

export default LoadingSpinner;