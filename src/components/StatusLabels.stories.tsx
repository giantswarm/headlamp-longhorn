import type { Meta, StoryObj } from '@storybook/react';
import { VolumeStateLabel } from './common';

const meta = {
  title: 'Longhorn/VolumeStateLabel',
  component: VolumeStateLabel,
  argTypes: {
    state: {
      control: 'select',
      options: ['attached', 'detached', 'attaching', 'detaching', 'creating', 'deleting'],
    },
  },
} satisfies Meta<typeof VolumeStateLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Attached: Story = { args: { state: 'attached' } };
export const Detached: Story = { args: { state: 'detached' } };
export const Attaching: Story = { args: { state: 'attaching' } };
export const Unknown: Story = { args: { state: undefined } };
