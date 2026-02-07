import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { BuildingImage } from '../../src/components/BuildingImage';

describe('BuildingImage', () => {
  it('renders placeholder when no imageUrl is provided', () => {
    render(<BuildingImage buildingName="Test Building" />);
    expect(screen.getByText('No image available')).toBeTruthy();
  });

  it('renders image when imageUrl is provided', () => {
    render(
      <BuildingImage
        imageUrl="https://example.com/image.jpg"
        buildingName="Test Building"
      />
    );
    const image = screen.getByLabelText('Photo of Test Building');
    expect(image).toBeTruthy();
    expect(image.props.source).toEqual({ uri: 'https://example.com/image.jpg' });
  });
});
