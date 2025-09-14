function LoadingSpinner({height}){
    return (
        <div style={{ minHeight: height }} className={`w-full flex justify-center items-center`}>
            <div className="h-10 w-10 border-4 border-blue-100 border-b-blue-600 animate-spin rounded-full mx-auto mt-10"></div>
        </div>
    );
}

export default LoadingSpinner;