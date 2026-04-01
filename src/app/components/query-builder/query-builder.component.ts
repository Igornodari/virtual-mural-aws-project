import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { Status } from 'src/app/shared/types';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FilterService } from 'src/app/core/services/filter.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';

export type QBFieldItemType = 'text' | 'number' | 'date' | 'boolean' | 'select';
export type QBFieldType = { key: string; label: string; type: QBFieldItemType; options?: Status[] };
type QBFormFieldType = { field: string; operator: string; value: any; value2?: any };

@Component({
	selector: 'app-query-builder',
	imports: [...importBase],
	templateUrl: './query-builder.component.html',
	encapsulation: ViewEncapsulation.None,
	styles: [
		`
			.filter-container {
				display: flex;
				flex-direction: column;
				gap: 16px;
				padding: 16px;
			}

			.rule-list {
				display: flex;
				flex-direction: column;
				gap: 12px;
			}

			.rule-row {
				display: flex;
				align-items: center;
				gap: 12px;
			}

			.field {
				flex: 2.5;
			}

			.operator {
				flex: 1.5;
			}

			.value {
				flex: 2;
			}


			.actions {
				display: flex;
				gap: 12px;
				justify-content: flex-end;
			}
			/* Responsivo */
			@media (max-width: 768px) {
				.rule-row {
					flex-direction: column;
					align-items: stretch;
				}

				.field,
				.operator,
				.value {
					width: 100%;
				}

				.actions {
					flex-direction: column;
					align-items: stretch;
				}
			}

		`,
	],
})
export class QueryBuilderComponent implements OnInit {
	filterForm!: FormGroup;
	public searchParams: any = {};
	fieldTypes: QBFieldItemType[] = [];
	operatorOptions: string[][] = [];

	operators: Record<QBFieldItemType, string[]> = {
		text: ['equal', 'like', 'not', 'notLike', 'notEmpty', 'isEmpty'],
		number: ['equal', 'not', 'moreThan', 'lessThan', 'notEmpty', 'isEmpty'],
		date: ['between', 'equal', 'moreThan', 'lessThan', 'notNull', 'isNull'],
		boolean: ['equal', 'notEmpty', 'isEmpty'],
		select: ['in'],
	};

	constructor(
		private fb: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<QueryBuilderComponent>,
		public filterService: FilterService,
		public _snackBar: SnackBarService
	) { }

	ngOnInit() {
		this.filterForm = this.fb.group({
			rules: this.fb.array([]),
		});

		if (this.filterService.get(this.data.name)?.formValue?.length) {
			this.filterService.get(this.data.name).formValue.forEach((rule: any, i: number) => {
				this.rules.push(
					this.fb.group({
						field: [rule.field],
						operator: [rule.operator],
						value: [rule.value],
						value2: [rule.value2],
					})
				);
				this.onOperatorsChange(i);
			});
		} else {
			this.addRule();
		}
	}

	get rules(): FormArray {
		return this.filterForm.get('rules') as FormArray;
	}

	addRule() {
		this.rules.push(
			this.fb.group({
				field: '',
				operator: '',
				value: '',
				value2: '',
			})
		);
	}

	removeRule(index: number) {
		this.rules.removeAt(index);
	}

	getFieldType(fieldKey: string): QBFieldItemType {
		return this.data.fields.find((f: QBFieldType) => f.key === fieldKey)?.type || 'text';
	}

	onOperatorsChange(index: number) {
		const ruleGroup = this.rules.at(index);
		const fieldKey = ruleGroup.value.field;

		const type = this.getFieldType(fieldKey);
		this.fieldTypes[index] = type;
		let availableOperators = [...this.operators[type]];

		this.operatorOptions[index] = availableOperators;

		if (type === 'select') {
			ruleGroup.patchValue({ operator: 'in' });
			return;
		}
		if (ruleGroup.get('operator')?.value == 'in') {
			ruleGroup.patchValue({ operator: '' });
		}

		const allRules = this.filterForm.value.rules;

		const currentOperator = ruleGroup.value.operator;

		const otherOperatorsForField = allRules
			.filter((r: QBFormFieldType, i: number) => r.field === fieldKey && i !== index)
			.map((r: QBFormFieldType) => r.operator);

		availableOperators = availableOperators.filter(op => !otherOperatorsForField.includes(op));

		if (currentOperator && !availableOperators.includes(currentOperator)) {
			availableOperators.unshift(currentOperator);
		}

		if (ruleGroup.get('operator')?.value == '') {
			ruleGroup.patchValue({ operator: availableOperators[0] });
		}

		this.operatorOptions[index] = availableOperators;

		if (availableOperators.length === 0 && type !== ('select' as any)) {
			this._snackBar.warning('Todos operadores utilizados para este campo!');
		}
	}

	getOptions(fieldKey: string): Status[] {
		return this.data.fields.find((f: QBFieldType) => f.key === fieldKey)?.options || [];
	}

	submit() {
		this.searchParams = {};
		const rules = this.filterForm.value.rules;

		const data = rules.filter((rule: QBFormFieldType) => {
			if (rule.field) {
				if (['isEmpty', 'notEmpty', 'notNull', 'isNull'].includes(rule.operator)) {
					rule.value = true;
				}
				if (rule.field && rule.value !== '') {
					return rule;
				}
			}

			return false;
		});

		const setQuery = (data: QBFormFieldType, operator: string) => {
			let value = data.value;
			let newOperator = operator;
			if (operator == 'between') {
				value = [data.value, data.value2];
			}

			if (operator == 'equal' && data.value instanceof Date && !isNaN(data.value.getTime())) {
				const start = new Date(data.value);
				start.setUTCHours(0, 0, 0, 0);

				const end = new Date(data.value);
				end.setUTCHours(23, 59, 59, 999);

				value = [start, end];
				newOperator = 'between';
			}

			this.searchParams[data.field] = this.searchParams[data.field]
				? [...this.searchParams[data.field], [newOperator, data.value]]
				: [[newOperator, value]];
		};

		for (let i = 0; i < data.length; i++) {
			if (data[i].operator) {
				setQuery(data[i], data[i].operator);
			}
		}

		this.filterService.set({
			name: this.data.name,
			search: this.searchParams,
			formValue: data,
		});

		this.dialogRef.close(this.searchParams);
		return;
	}

	clear() {
		const rulesArray = this.rules;
		while (rulesArray.length !== 0) {
			rulesArray.removeAt(0);
		}
		this.addRule();
		this.searchParams = {};

		this.dialogRef.close(this.filterService.clear(this.data.name).search);
	}
}
