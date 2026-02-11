import React from 'react';

export default function Loading() {
    return (
        <div className="cat-loading-container">
            <div className="cat">
                <div className="cat-body"></div>
                <div className="cat-head">
                    <div className="cat-ears">
                        <div className="cat-ear left"></div>
                        <div className="cat-ear right"></div>
                    </div>
                    <div className="cat-face">
                        <div className="cat-eyes">
                            <div className="cat-eye left"></div>
                            <div className="cat-eye right"></div>
                        </div>
                        <div className="cat-nose"></div>
                        <div className="cat-mouth"></div>
                    </div>
                </div>
                <div className="cat-tail"></div>
            </div>
            <p className="loading-text">Loading...</p>
        </div>
    );
}
