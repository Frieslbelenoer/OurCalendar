import React from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'default';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title = 'Konfirmasi',
    message,
    confirmText = 'Yakin',
    cancelText = 'Batal',
    onConfirm,
    onCancel,
    variant = 'default'
}) => {
    if (!isOpen) return null;

    const confirmBtnClass = variant === 'danger'
        ? 'confirm-btn-danger'
        : variant === 'warning'
            ? 'confirm-btn-warning'
            : 'confirm-btn-default';

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                <div className="confirm-header">
                    <h3>{title}</h3>
                </div>
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-actions">
                    <button className="confirm-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`confirm-btn ${confirmBtnClass}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
