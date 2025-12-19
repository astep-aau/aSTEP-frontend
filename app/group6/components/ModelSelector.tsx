'use client';

import React, { useState } from 'react';
import {
	Check,
	ChevronsUpDown
} from 'lucide-react';
import {
	ModelMetrics,
	ModelType
} from '../services/imputation';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
	modelType: ModelType[]
	modelMetrics: ModelMetrics[];
	selectedModels: string[];
	onSelectionChange: (ids: string[]) => void;
	maxSelection?: number;
}

export default function ModelSelector({
	modelType,
	modelMetrics,
	selectedModels,
	onSelectionChange,
	maxSelection = 2,
}: ModelSelectorProps) {
	const [open, setOpen] = useState(false);

	// Create a lookup map: model_type ID -> ModelType name
	const modelTypeMap = React.useMemo(() => {
		return new Map(modelType.map(mt => [mt.id, mt.name]));
	}, [modelType]);

	const handleToggle = (modelId: string) => {
		if (selectedModels.includes(modelId)) {
			// Remove
			onSelectionChange(selectedModels.filter(id => id !== modelId));
		} else {
			// Add (if under limit)
			if (selectedModels.length < maxSelection) {
				onSelectionChange([...selectedModels, modelId]);
			}
		}
	};

	return (
		<div className="grid space-y-1">
			<label className="text-sm font-medium">
				Select Models ({selectedModels.length}/{maxSelection})
			</label>

			<Popover open={open} onOpenChange={setOpen}>
				{/* Trigger button */}
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-[255px] justify-between"
					>
						{selectedModels.length === 0
							? "Choose models..."
							: `${selectedModels.length} selected`
						}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>

				{/* Dropdown menu */}
				<PopoverContent
					align="start"
					className="w-[var(--radix-popover-trigger-width)] rounded-md border shadow-md p-0"
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					<div className="max-h-60 overflow-auto p-2 space-y-1">
						{modelMetrics.map((model) => {
							const isSelected =
								selectedModels.includes(model.id);
							const isDisabled = !isSelected &&
								selectedModels.length >= maxSelection;

							return (
								<div
									key={model.id}
									className={cn(
										"flex items-center gap-2 p-2 rounded cursor-pointer", "hover:bg-accent",
										isDisabled && "opacity-50 cursor-not-allowed"
									)}
									onClick={() => !isDisabled &&
										handleToggle(model.id)}
								>
									<Checkbox
										checked={isSelected}
										disabled={isDisabled}
										onCheckedChange={() => !isDisabled
											&& handleToggle(model.id)}
									/>
									<div className="flex-1">
										<div className="font-medium text-sm">
											{modelTypeMap.get(model.model_type) || model.model_type}
										</div>

										{model.loss && model.loss.length > 0 ? (
											model.loss.map((loss, index) => (
												<div key={index}
													className="text-xs text-muted-foreground">
													{loss.type}:
													{' '}{loss.loss_value.toFixed(2)}
													{' '}{loss.loss_unit}
												</div>
											))
										) : (
											<div className="text-xs text-muted-foreground">
												No metrics available
											</div>
										)}

										<div className="text-xs text-muted-foreground">
											Training: {model.train_time_min ?? 'N/A'}
											{' '}min
										</div>
									</div>
									{isSelected && <Check className="h-4 w-4 text-primary" />}
								</div>
							);
						})}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
