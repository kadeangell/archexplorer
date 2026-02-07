import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { BuildingCard } from '../../src/components/BuildingCard';
import type { ArchitecturalDetail } from '../../src/types';

jest.mock('../../src/components/BuildingImage', () => ({
  BuildingImage: ({ buildingName }: any) => {
    const { Text } = require('react-native');
    return <Text testID="building-image">{buildingName}</Text>;
  },
}));

const mockBuilding: ArchitecturalDetail = {
  id: 'test-1',
  name: 'Test Building',
  address: '123 Test Street',
  style: 'Art Deco',
  yearBuilt: '1930',
  architect: 'Test Architect',
  description: 'A beautiful test building.',
  notableFeatures: ['Grand lobby', 'Observation deck'],
  historicalSignificance: 'A landmark of testing.',
  distance: null,
};

describe('BuildingCard', () => {
  it('renders building name', () => {
    render(<BuildingCard building={mockBuilding} />);
    expect(screen.getByText('Test Building')).toBeTruthy();
  });

  it('renders architectural style', () => {
    render(<BuildingCard building={mockBuilding} />);
    expect(screen.getByText('Art Deco')).toBeTruthy();
  });

  it('renders address', () => {
    render(<BuildingCard building={mockBuilding} />);
    expect(screen.getByText('123 Test Street')).toBeTruthy();
  });

  it('renders year and architect', () => {
    render(<BuildingCard building={mockBuilding} />);
    expect(screen.getByText('1930 · Test Architect')).toBeTruthy();
  });

  it('renders description', () => {
    render(<BuildingCard building={mockBuilding} />);
    expect(screen.getByText('A beautiful test building.')).toBeTruthy();
  });

  it('renders notable features', () => {
    render(<BuildingCard building={mockBuilding} />);
    expect(screen.getByText('Notable Features:')).toBeTruthy();
    expect(screen.getByText('• Grand lobby')).toBeTruthy();
    expect(screen.getByText('• Observation deck')).toBeTruthy();
  });

  it('renders historical significance', () => {
    render(<BuildingCard building={mockBuilding} />);
    expect(screen.getByText('A landmark of testing.')).toBeTruthy();
  });

  it('renders BuildingImage when imageUrl is present', () => {
    const buildingWithImage = {
      ...mockBuilding,
      imageUrl: 'https://example.com/image.jpg',
    };
    render(<BuildingCard building={buildingWithImage} />);
    expect(screen.getByTestId('building-image')).toBeTruthy();
  });

  it('does not render BuildingImage when imageUrl is absent', () => {
    render(<BuildingCard building={mockBuilding} />);
    expect(screen.queryByTestId('building-image')).toBeNull();
  });
});
