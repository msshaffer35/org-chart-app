import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../store/useStore';

const TextNode = ({ id, data, selected }) => {
    const updateNodeData = useStore((state) => state.updateNodeData);
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(data.label || 'Text');
    const textareaRef = useRef(null);

    useEffect(() => {
        setText(data.label);
    }, [data.label]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
            // Auto-resize height
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (text !== data.label) {
            updateNodeData(id, { label: text });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
        }
    };

    const handleChange = (e) => {
        setText(e.target.value);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <div
            className={`
                group relative min-w-[150px] min-h-[50px] p-2 rounded border transition-all duration-200
                ${selected ? 'border-blue-500 ring-1 ring-blue-200' : 'border-transparent hover:border-gray-300'}
                ${!isEditing && !data.label ? 'bg-gray-50/50' : 'bg-transparent'}
            `}
            onDoubleClick={() => setIsEditing(true)}
        >
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full bg-white border border-blue-400 rounded p-1 text-gray-800 resize-none outline-none overflow-hidden"
                    style={{ minHeight: '40px' }}
                />
            ) : (
                <div className="w-full h-full whitespace-pre-wrap text-gray-800 p-1">
                    {data.label || <span className="text-gray-400 italic">Double click to edit</span>}
                </div>
            )}

            {/* Optional handles if we want to connect text to things later */}
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-transparent !border-none" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-transparent !border-none" />
        </div>
    );
};

export default memo(TextNode);
