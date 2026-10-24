import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import axios from 'axios';
import SummaryApi from '../common'
import Modal from 'react-modal'; // Optional if using react-modal

// Optional: Set app element for accessibility
Modal.setAppElement('#root'); // Ensure #root matches your app root element ID

const Payment = ({ totalAmount, isOpen, onRequestClose }) => {
    const [upiURL, setUpiURL] = useState('');

    const generateUpiURL = async () => {
        try {
            const response = await axios.post(SummaryApi.QrPayment.url, { amount: totalAmount });
            setUpiURL(response.data.upiURL);
        } catch (error) {
            console.error('Error generating UPI URL:', error);
        }
    };

    useEffect(() => {
        if (totalAmount) {
            generateUpiURL();
        }
    }, [totalAmount]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Payment Modal"
            className="modal flex flex-center justify-center"
            overlayClassName="overlay"
        >
            <div className="payment-modal-content mt-10">
                <h2 className="text-black mt-15 ">Total Amount: ₹{totalAmount}</h2>
                {upiURL ? (
                    <div className="qr-code-container flex flex-center justify-center">
                        <QRCode value={upiURL} />
                    </div>
                ) : (
                    <p>Generating payment QR code...</p>
                )}
                <button onClick={onRequestClose} className="cancel-button">Cancel</button>
            </div>
        </Modal>
    );
};

export default Payment;