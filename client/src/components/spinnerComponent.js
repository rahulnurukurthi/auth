import React from 'react';
import ClipLoader from "react-spinners/ClipLoader";
import '../styles/spinnerStyles.css';

const SpinnerComponent = ({ loading }) => {
    return (
        <div className="spinner-overlay">
            <ClipLoader
                color="#263e80"
                loading={loading}
                className="spinner"
                size={50}
            />
        </div>
    );
};

export default SpinnerComponent;
