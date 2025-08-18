import { Dispatch, SetStateAction } from "react";

export type dropDownItemsType = {
    label: string;
    value: number | string;
};

interface stylesProps {
    wrapper?: string;
    label?: string;
    inputWrapper?: string;
    placeholder?: string;
    listWrapper?: string;
}

type customInputProps = {
    value: Array<string>;
    setValue: Dispatch<SetStateAction<any>>;
    error?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    data?: dropDownItemsType[];
    style?: stylesProps;
};

const CourseSelection = ({
    value,
    setValue,
    error,
    label,
    placeholder,
    required,
    data,
    style
}: customInputProps) => {

    const handleCheckboxChange = (itemValue: string) => {
        if (value.includes(itemValue)) {
            // If item is already in the value array, remove it
            setValue(value.filter((val) => val !== itemValue));
        } else {
            // If item is not in the value array, add it
            setValue([...value, itemValue]);
        }
    };

    return (
        <div className={`${error ? 'mb-0 md:mb-0' : style?.wrapper ? style?.wrapper : 'mb-3 md:mb-5'}`}>

            <div className={`flex flex-row justify-start`}>
                <label className={`block text-sm font-medium leading-6 text-label mr-1  ${style?.label && style?.label}`}>
                    {label}
                </label>

                {required && (
                    <label className="block text-sm font-medium leading-6 text-labelRequired mr-1">*</label>
                )}
            </div>

            <div className="w-full">
                <div className={`w-full flex flex-row flex-wrap rounded-b-md bg-inputBackground ${style?.listWrapper ? style?.listWrapper : ''}`}>
                    {
                        data?.map((item: dropDownItemsType, index: number) => (
                            <div key={index} className="flex items-center px-4 py-1">
                                <input
                                    type="checkbox"
                                    checked={value.includes(item.value.toString())}
                                    onChange={() => handleCheckboxChange(item.value.toString())}
                                    className="mr-2"
                                />
                                <label className={`text-sm ${value.includes(item.value.toString()) ? 'text-radio' : 'text-neutral-600'} md:text-md font-medium`}>
                                    {item.label}
                                </label>
                            </div>
                        ))
                    }
                </div>
            </div>

            {error && (
                <label className="block font-medium leading-6 text-labelRequired mr-1 text-xs">
                    {error}
                </label>
            )}

        </div>
    );
};

export default CourseSelection;