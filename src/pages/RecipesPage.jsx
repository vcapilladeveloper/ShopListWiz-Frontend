import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/constants';
import { getCookie, deleteCookie } from '../utils/cookieUtils';
import { useNavigate } from 'react-router-dom';
const initialFormState = {
    name: '',
    ingredients: [],
    isForDinner: false
}

const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const RecipesPage = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        const token = getCookie('userToken');
        if (!token) {
            setIsLoading(false);
            navigate('/');
            return;
        }

        try {
            if (!API_ENDPOINTS.RECIPES) {
                throw new Error(t('dashboard.apiConfigError'));
            }

            const response = await fetch(API_ENDPOINTS.RECIPES, {
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

            setRecipes(data);
        } catch (err) {
            setError(err.message || t('dashboard.loadUserDataError'));
            deleteCookie('userToken');
            navigate('/login');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center"><p>{t('common.loading')}</p></div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500"><p>{t('common.error')}: {error}</p></div>;
    }

    const filteredRecipes = recipes.filter(ing => {
        const term = removeAccents(searchTerm.toLowerCase());
        return (
            removeAccents(ing.name.toLowerCase()).includes(term)
        );
    });

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('recipesPage.title')}</h1>
                {/* <button
                    onClick={() => handleOpenModal(null, 'edit')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                    {t('recipesPage.addIngredient')}
                </button> */}
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder={t('recipesPage.searchPlaceholder')}
                    className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('recipesPage.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('recipesPage.isDinner')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('recipesPage.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRecipes.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                    {searchTerm
                                        ? t('recipesPage.noResults')
                                        : t('recipesPage.noIngredients')}
                                </td>
                            </tr>
                        ) : (
                            filteredRecipes.map((ing) => (
                                <tr key={ing.id} onClick={() => handleOpenModal(ing, 'view')} className="cursor-pointer hover:bg-gray-100 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ing.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ing.isForDinner}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal(ing, 'edit'); }} className="text-indigo-600 hover:text-indigo-900 mr-3">{t('common.edit')}</button>
                                        {/* <button onClick={(e) => { e.stopPropagation(); handleDelete(ing.id); }} className="text-red-600 hover:text-red-900">{t('common.delete')}</button> */}
                                    </td>
                                </tr>
                            ))
                        )}
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
                                ? (editingIngredient ? t('recipesPage.editIngredient') : t('recipesPage.addIngredient'))
                                : t('recipesPage.viewIngredient')
                            }
                        </h2>
                        {formError && <p className="mb-4 text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">{formError}</p>}
                        {isEditMode ? ( // Form is rendered only in edit mode
                            <form id="ingredient-form" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="english" className="block text-sm font-medium text-gray-700">{t('recipesPage.nameEnglish')}</label>
                                        <input type="text" name="english" id="english" value={formData.english} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="spanish" className="block text-sm font-medium text-gray-700">{t('recipesPage.nameSpanish')}</label>
                                        <input type="text" name="spanish" id="spanish" value={formData.spanish} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="catalan" className="block text-sm font-medium text-gray-700">{t('recipesPage.nameCatalan')}</label>
                                        <input type="text" name="catalan" id="catalan" value={formData.catalan} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                    </div>
                                </div>

                                <fieldset className="mb-4 border p-4 rounded-md">
                                    <legend className="text-lg font-medium text-gray-900 px-2">{t('recipesPage.nutritionalValues')}</legend>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        <div>
                                            <label htmlFor="calories" className="block text-sm font-medium text-gray-700">{t('recipesPage.calories')}</label>
                                            <input type="number" name="calories" id="calories" value={formData.nutritionalValuesPer100G.calories} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="protein_g" className="block text-sm font-medium text-gray-700">{t('recipesPage.protein')}</label>
                                            <input type="number" name="protein_g" id="protein_g" value={formData.nutritionalValuesPer100G.protein_g} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="carbohydrates_g" className="block text-sm font-medium text-gray-700">{t('recipesPage.carbohydrates')}</label>
                                            <input type="number" name="carbohydrates_g" id="carbohydrates_g" value={formData.nutritionalValuesPer100G.carbohydrates_g} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="fat_g" className="block text-sm font-medium text-gray-700">{t('recipesPage.fat')}</label>
                                            <input type="number" name="fat_g" id="fat_g" value={formData.nutritionalValuesPer100G.fat_g} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="fiber_g" className="block text-sm font-medium text-gray-700">{t('recipesPage.fiber')}</label>
                                            <input type="number" name="fiber_g" id="fiber_g" value={formData.nutritionalValuesPer100G.fiber_g} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="vitamin_D" className="block text-sm font-medium text-gray-700">{t('recipesPage.vitaminD')}</label>
                                            <input type="number" name="vitamin_D" id="vitamin_D" value={formData.nutritionalValuesPer100G.vitamin_D} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="vitamin_B12" className="block text-sm font-medium text-gray-700">{t('recipesPage.vitaminB12')}</label>
                                            <input type="number" name="vitamin_B12" id="vitamin_B12" value={formData.nutritionalValuesPer100G.vitamin_B12} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="vitamin_C" className="block text-sm font-medium text-gray-700">{t('recipesPage.vitaminC')}</label>
                                            <input type="number" name="vitamin_C" id="vitamin_C" value={formData.nutritionalValuesPer100G.vitamin_C} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="iron" className="block text-sm font-medium text-gray-700">{t('recipesPage.iron')}</label>
                                            <input type="number" name="iron" id="iron" value={formData.nutritionalValuesPer100G.iron} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="saturated_fat" className="block text-sm font-medium text-gray-700">{t('recipesPage.saturatedFat')}</label>
                                            <input type="number" name="saturated_fat" id="saturated_fat" value={formData.nutritionalValuesPer100G.saturated_fat} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="unsaturated_fat" className="block text-sm font-medium text-gray-700">{t('recipesPage.unsaturatedFat')}</label>
                                            <input type="number" name="unsaturated_fat" id="unsaturated_fat" value={formData.nutritionalValuesPer100G.unsaturated_fat} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="magnesium" className="block text-sm font-medium text-gray-700">{t('recipesPage.magnesium')}</label>
                                            <input type="number" name="magnesium" id="magnesium" value={formData.nutritionalValuesPer100G.magnesium} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                        <div>
                                            <label htmlFor="zinc" className="block text-sm font-medium text-gray-700">{t('recipesPage.zinc')}</label>
                                            <input type="number" name="zinc" id="zinc" value={formData.nutritionalValuesPer100G.zinc} onChange={handleNutritionalChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="any" />
                                        </div>
                                    </div>
                                </fieldset>

                                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center">
                                        <input id="isGlutenFree" name="isGlutenFree" type="checkbox" checked={formData.isGlutenFree} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <label htmlFor="isGlutenFree" className="ml-2 block text-sm text-gray-900">{t('recipesPage.isGlutenFree')}</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="isVegan" name="isVegan" type="checkbox" checked={formData.isVegan} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <label htmlFor="isVegan" className="ml-2 block text-sm text-gray-900">{t('recipesPage.isVegan')}</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="isVegetarian" name="isVegetarian" type="checkbox" checked={formData.isVegetarian} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <label htmlFor="isVegetarian" className="ml-2 block text-sm text-gray-900">{t('recipesPage.isVegetarian')}</label>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
                                    {renderDetail(t('recipesPage.nameEnglish'), formData.english, 'view-english-name')}
                                    {renderDetail(t('recipesPage.nameSpanish'), formData.spanish, 'spanish-name')}
                                    {renderDetail(t('recipesPage.nameCatalan'), formData.catalan, 'view-catalan-name')}
                                </div>
                                <fieldset className="border p-4 rounded-md">
                                    <legend className="text-lg font-medium text-gray-900 px-2">{t('recipesPage.nutritionalValues')}</legend>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        {Object.entries(formData.nutritionalValuesPer100G).map(([key, value]) => {
                                            const labelKey = nutritionalKeyToLabelMap[key];
                                            return labelKey ? renderDetail(t(`recipesPage.${labelKey}`), value, key) : null;
                                        })}
                                    </div>
                                </fieldset>
                                <div className="flex space-x-4 p-4">
                                    {formData.isGlutenFree && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{t('recipesPage.isGlutenFree')}</span>}
                                    {formData.isVegan && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{t('recipesPage.isVegan')}</span>}
                                    {formData.isVegetarian && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">{t('recipesPage.isVegetarian')}</span>}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-8">
                            {isEditMode ? (
                                <>
                                    <button type="button" onClick={handleCloseModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-150 ease-in-out">
                                        {t('common.cancel')}
                                    </button>
                                    <button // Changed type to "button" and added onClick handler
                                        type="button"
                                        onClick={handleSubmit}
                                        form="ingredient-form"
                                        disabled={isSubmitting}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:bg-green-300 disabled:cursor-not-allowed">
                                        {isSubmitting ? t('common.saving') : t('common.save')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" onClick={handleCloseModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-150 ease-in-out">
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="button" onClick={() => setIsEditMode(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
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

export default RecipesPage;