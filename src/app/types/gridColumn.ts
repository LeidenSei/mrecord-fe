export class DataGridColumn {
  dataField?: string;
  caption: string;
  width?: number;
  calculateCellValue?: (data: any) => any;
  summaryType?: string;
  dataType?: string;
  fixed: boolean;
  fixedPosition?: string;
  allowFiltering?: boolean;
  alignment?: string;
  buttons?: Array<{ icon: string; onClick: (data: any) => void }>; // Thêm field buttons
  type?: string;
  // @ts-ignore
  constructor(
    dataField: string,
    caption: string,
    width?: number,
    fixed?: boolean,
    fixedPosition?: string,
    calculateCellValue?: (data: any) => any,
    summaryType?: string,
    dataType?: string,
    allowFiltering?: boolean,
    alignment?: string,
    buttons?: Array<{ icon: string; onClick: (data: any) => void }>, // Thêm vào constructor
    type?: string // Loại của cột (có thể là buttons)
  ) {
    this.dataField = dataField;
    this.caption = caption;
    this.width = width;
    this.calculateCellValue = calculateCellValue;
    this.summaryType = summaryType;
    this.dataType = dataType;
    this.fixed = fixed;
    this.allowFiltering = allowFiltering;
    this.alignment = alignment;
    this.fixedPosition = fixedPosition;
    this.buttons = buttons; // Gán buttons
    this.type = type; // Gán type cho cột
  }
}
