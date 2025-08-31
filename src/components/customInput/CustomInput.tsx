import { Dispatch, SetStateAction } from "react";
import './customInput.css';

interface stylesProps {
    wrapper?: string;
    label?: string;
    input?: string;
    error?: string;

};

type customInputProps = {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    error?: string;
    setError?: Dispatch<SetStateAction<string>>;
    label?: string;
    placeholder: string;
    required?: boolean;
    type?: 'text' | 'email' | 'password' | 'number';
    outlined?: boolean;
    style?: stylesProps;

};

const CustomInput = ({
    value,
    setValue,
    error,
    setError,
    label,
    placeholder,
    required,
    type,
    outlined,
    style,

}: customInputProps) => {

    return (
        <div className={`${error ? 'mb-0 md:mb-0' : style?.wrapper ? style.wrapper : 'mb-3 md:mb-5 '}`} >

            <div className={`flex flex-row justify-start`} >
                <label className={`block text-sm font-medium leading-6 text-label mr-1  ${style?.label ? style?.label : ''}`}>{label}</label>

                {
                    required && (
                        <label className="block text-sm font-medium leading-6 text-labelRequired mr-1">*</label>

                    )
                }

            </div>

            <input
                type={type ? type : 'text'}
                value={value}
                disabled={placeholder === "e.g user@gmail.com"}
                required={required ? required : false}
                onChange={(e) => setValue(e.target.value)}
                className={`block w-full  py-1.5 pl-7 pr-20 text-gray-900 ${outlined ? "border-b bg-transparent" : "border border-inputBorder rounded-md bg-inputBackground"} ${error ? 'border-labelRequired' : 'border-inputBorder'} placeholder:text-inputPlaceholder focus:border-black-600 sm:text-sm sm:leading-6 font-ubuntu font-medium  ${style?.input ? style?.input : ''}`}
                placeholder={placeholder}
                onFocus={() => {
                    if (error && setError) {
                        setError('');
                    }
                }}
            />
            {
                error && (
                    <label className={`block font-medium leading-6 text-labelRequired mr-1 text-xs  ${style?.error ? style?.error : ''}`}>{error}</label>

                )
            }

        </div>


    );
};

export default CustomInput;