import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFeatures } from '../store/slices/featuresSlice';
import { Feature } from '../models/types/feature.types';

export const useFeaturesViewModel = () => {
  const dispatch = useAppDispatch();
  const { features, isLoading, error } = useAppSelector((state) => state.features);
  const language = useAppSelector((state) => state.ui.language);

  useEffect(() => {
    if (features.length === 0) {
      dispatch(fetchFeatures());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTitle = (feature: Feature): string => {
    return language === 'en' ? feature.title_en : feature.title_sv;
  };

  const getShortDescription = (feature: Feature): string => {
    return language === 'en' ? feature.shortDescription_en : feature.shortDescription_sv;
  };

  const getFullDescription = (feature: Feature): string => {
    return language === 'en' ? feature.fullDescription_en : feature.fullDescription_sv;
  };

  return {
    features,
    isLoading,
    error,
    language,
    getTitle,
    getShortDescription,
    getFullDescription,
  };
};

export default useFeaturesViewModel;
