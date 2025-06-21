import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/constants';
import { getCookie, deleteCookie } from '../utils/cookieUtils';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react'; // Import useRef
const initialFormState = {
    english: '',
    spanish: '',
    catalan: '',
    nutritionalValuesPer100G: {
        calories: '',
        carbohydrates_g: '',
        protein_g: '',
        fat_g: '',
        fiber_g: '',
        vitamin_D: '',
        vitamin_B12: '',
        vitamin_C: '',
        iron: '',
        saturated_fat: '',
        unsaturated_fat: '',
        magnesium: '',
        zinc: '',
    },
    isGlutenFree: false,
    isVegan: false,
    isVegetarian: false,
};

const nutritionalKeyToLabelMap = {
    calories: 'calories',
    protein_g: 'protein',
    carbohydrates_g: 'carbohydrates',
    fat_g: 'fat',
    fiber_g: 'fiber',
    vitamin_D: 'vitaminD',
    vitamin_B12: 'vitaminB12',
    vitamin_C: 'vitaminC',
    iron: 'iron',
    saturated_fat: 'saturatedFat',
    unsaturated_fat: 'unsaturatedFat',
    magnesium: 'magnesium',
    zinc: 'zinc',
};

const IngredientsPage = () => {
    const { t } = useTranslation();
    const [ingredients, setIngredients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const formRef = useRef(null); // Create a ref for the form
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, [navigate, t]);

    const fetchUserData = async () => {
        const token = getCookie('userToken');
        if (!token) {
            setIsLoading(false);
            navigate('/');
            return;
        }

        try {
            if (!API_ENDPOINTS.ME) {
                throw new Error(t('dashboard.apiConfigError'));
            }

            const response = await fetch(API_ENDPOINTS.INGREDIENTS, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    deleteCookie('userToken');
                    navigate('/login');
                    return;
                }
                throw new Error(data.message || t('dashboard.fetchUserError', { statusCode: response.status }));
            }

            setIngredients(data);
        } catch (err) {
            setError(err.message || t('dashboard.loadUserDataError'));
            deleteCookie('userToken');
            navigate('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (ingredient = null, mode = 'edit') => {
        console.log(`Opening modal for ingredient: %o in ${mode} mode`, ingredient);
        if (ingredient) {
            setEditingIngredient(ingredient);
            const formDataFromIngredient = {
                ...initialFormState,
                english: ingredient.english || '',
                spanish: ingredient.spanish || '',
                catalan: ingredient.catalan || '',
                nutritionalValuesPer100G: ingredient.nutritional_values_per_100g
                    ? { ...initialFormState.nutritionalValuesPer100G, ...ingredient.nutritional_values_per_100g }
                    : { ...initialFormState.nutritionalValuesPer100G },
                isGlutenFree: ingredient.hasOwnProperty('is_gluten_free') ? ingredient.is_gluten_free : initialFormState.isGlutenFree,
                isVegan: ingredient.hasOwnProperty('is_vegan') ? ingredient.is_vegan : initialFormState.isVegan,
                isVegetarian: ingredient.hasOwnProperty('is_vegetarian') ? ingredient.is_vegetarian : initialFormState.isVegetarian,
            };
            setFormData(formDataFromIngredient);
        } else {
            setEditingIngredient(null);
            setFormData(initialFormState);
        }
        setIsEditMode(mode === 'edit');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        console.log("handleCloseModal ha sido llamada. Cerrando modal.");
        setIsModalOpen(false);
        setEditingIngredient(null);
        setIsEditMode(false);
        setFormData(initialFormState);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleNutritionalChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            nutritionalValuesPer100G: {
                ...prev.nutritionalValuesPer100G,
                [name]: value === '' ? '' : parseFloat(value),
            },
        }));
    };

    const handleSubmit = (e) => { // Keep the event parameter
        console.log("handleSubmit triggered. Event:", e);
        console.log("Event type:", e.type);
        console.log("Event isTrusted:", e.isTrusted);
        console.log("Event target:", e.target);
        console.log("Current isEditMode:", isEditMode);
        console.log("Current editingIngredient:", editingIngredient);

        e.preventDefault(); // Crucial to prevent default browser form submission (page reload)

        if (editingIngredient) {
            console.log("Editing existing ingredient:", editingIngredient.id);
            setIngredients(prevIngredients =>
                prevIngredients.map(ing =>
                    ing.id === editingIngredient.id ? { ...formData, id: editingIngredient.id } : ing
                )
            );
        } else {
            const newIngredient = { ...formData };
            setIngredients(prevIngredients => [...prevIngredients, newIngredient]);
        }
        handleCloseModal(); // Close modal after processing
    };

    if (isLoading) {
        return <div className="p-8 text-center"><p>{t('common.loading')}</p></div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500"><p>{t('common.error')}: {error}</p></div>;
    }

    const renderDetail = (label, value, key) => {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        return (
            <div key={key}>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-1 text-sm text-gray-900">{String(value)}</p>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('ingredientsPage.title')}</h1>
                <button
                    onClick={() => handleOpenModal(null, 'edit')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                    {t('ingredientsPage.addIngredient')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('ingredientsPage.nameEnglish')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('ingredientsPage.nameSpanish')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('ingredientsPage.nameCatalan')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('ingredientsPage.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ingredients.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                    {t('ingredientsPage.noIngredients')}
                                </td>
                            </tr>
                        )}
                        {ingredients.map((ing) => (
                            <tr key={ing.id} onClick={() => handleOpenModal(ing, 'view')} className="cursor-pointer hover:bg-gray-100 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ing.english}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ing.spanish}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ing.catalan}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(ing, 'edit'); }} className="text-indigo-600 hover:text-indigo-900 mr-3">{t('common.edit')}</button>
                                    {/* <button onClick={(e) => { e.stopPropagation(); handleDelete(ing.id); }} className="text-red-600 hover:text-red-900">{t('common.delete')}</button> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-semibold mb-6">
                            {isEditMode
                                ? (editingIngredient ? t('ingredientsPage.editIngredient') : t('ingredientsPage.addIngredient'))
                                : t('ingredientsPage.viewIngredient')
                            }
                        </h2>
                        {isEditMode ? ( // Form is rendered only in edit mode
                            <form id="ingredient-form" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="english" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.nameEnglish')}</label>
                                        <input type="text" name="english" id="english" value={formData.english} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="spanish" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.nameSpanish')}</label>
                                        <input type="text" name="spanish" id="spanish" value={formData.spanish} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="catalan" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.nameCatalan')}</label>
                                        <input type="text" name="catalan" id="catalan" value={formData.catalan} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                    </div>
                                </div>

                                <fieldset className="mb-4 border p-4 rounded-md">
                                    <legend className="text-lg font-medium text-gray-900 px-2">{t('ingredientsPage.nutritionalValues')}</legend>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        <div>
                                            <label htmlFor="calories" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.calories')}</label>
                                            <input type="number" name="calories" id="calories" value={formData.nutritionalValuesPer100G.calories} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="protein_g" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.protein')}</label>
                                            <input type="number" name="protein_g" id="protein_g" value={formData.nutritionalValuesPer100G.protein_g} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="carbohydrates_g" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.carbohydrates')}</label>
                                            <input type="number" name="carbohydrates_g" id="carbohydrates_g" value={formData.nutritionalValuesPer100G.carbohydrates_g} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="fat_g" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.fat')}</label>
                                            <input type="number" name="fat_g" id="fat_g" value={formData.nutritionalValuesPer100G.fat_g} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="fiber_g" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.fiber')}</label>
                                            <input type="number" name="fiber_g" id="fiber_g" value={formData.nutritionalValuesPer100G.fiber_g} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="vitamin_D" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.vitaminD')}</label>
                                            <input type="number" name="vitamin_D" id="vitamin_D" value={formData.nutritionalValuesPer100G.vitamin_D} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="vitamin_B12" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.vitaminB12')}</label>
                                            <input type="number" name="vitamin_B12" id="vitamin_B12" value={formData.nutritionalValuesPer100G.vitamin_B12} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="vitamin_C" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.vitaminC')}</label>
                                            <input type="number" name="vitamin_C" id="vitamin_C" value={formData.nutritionalValuesPer100G.vitamin_C} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="iron" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.iron')}</label>
                                            <input type="number" name="iron" id="iron" value={formData.nutritionalValuesPer100G.iron} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="saturated_fat" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.saturatedFat')}</label>
                                            <input type="number" name="saturated_fat" id="saturated_fat" value={formData.nutritionalValuesPer100G.saturated_fat} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="unsaturated_fat" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.unsaturatedFat')}</label>
                                            <input type="number" name="unsaturated_fat" id="unsaturated_fat" value={formData.nutritionalValuesPer100G.unsaturated_fat} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="magnesium" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.magnesium')}</label>
                                            <input type="number" name="magnesium" id="magnesium" value={formData.nutritionalValuesPer100G.magnesium} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="zinc" className="block text-sm font-medium text-gray-700">{t('ingredientsPage.zinc')}</label>
                                            <input type="number" name="zinc" id="zinc" value={formData.nutritionalValuesPer100G.zinc} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                    </div>
                                </fieldset>

                                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center">
                                        <input id="isGlutenFree" name="isGlutenFree" type="checkbox" checked={formData.isGlutenFree} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <label htmlFor="isGlutenFree" className="ml-2 block text-sm text-gray-900">{t('ingredientsPage.isGlutenFree')}</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="isVegan" name="isVegan" type="checkbox" checked={formData.isVegan} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <label htmlFor="isVegan" className="ml-2 block text-sm text-gray-900">{t('ingredientsPage.isVegan')}</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="isVegetarian" name="isVegetarian" type="checkbox" checked={formData.isVegetarian} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <label htmlFor="isVegetarian" className="ml-2 block text-sm text-gray-900">{t('ingredientsPage.isVegetarian')}</label>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
                                    {renderDetail(t('ingredientsPage.nameEnglish'), formData.english, 'view-english-name')}
                                    {renderDetail(t('ingredientsPage.nameSpanish'), formData.spanish, 'spanish-name')}
                                    {renderDetail(t('ingredientsPage.nameCatalan'), formData.catalan, 'view-catalan-name')}
                                </div>
                                <fieldset className="border p-4 rounded-md">
                                    <legend className="text-lg font-medium text-gray-900 px-2">{t('ingredientsPage.nutritionalValues')}</legend>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        {Object.entries(formData.nutritionalValuesPer100G).map(([key, value]) => {
                                            const labelKey = nutritionalKeyToLabelMap[key];
                                            return labelKey ? renderDetail(t(`ingredientsPage.${labelKey}`), value, key) : null;
                                        })}
                                    </div>
                                </fieldset>
                                <div className="flex space-x-4 p-4">
                                    {formData.isGlutenFree && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{t('ingredientsPage.isGlutenFree')}</span>}
                                    {formData.isVegan && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{t('ingredientsPage.isVegan')}</span>}
                                    {formData.isVegetarian && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">{t('ingredientsPage.isVegetarian')}</span>}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-8">
                            {isEditMode ? (
                                <>
                                    <button type="button" onClick={handleCloseModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-150 ease-in-out">
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="button" // Change to type="button"
                                        onClick={() => formRef.current && formRef.current.submit()} // Manually trigger form submission
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
                                        {t('common.save')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" onClick={handleCloseModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-150 ease-in-out">
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenModal(editingIngredient, 'edit');
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                                    >
                                        {t('common.edit')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IngredientsPage;