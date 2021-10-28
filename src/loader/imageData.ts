export interface ImageData {
  id: string;
  seriesId: string;
  studyId: string;
  transferSyntax: string; // 转换格式
  bitsAllocated: number; // 一个像素取样点存储时分配到的位数，一般RGB的图像，每一个颜色通道都使用8位，所以一般取值为8。对于灰度图像，如果是256级灰阶，一般就是8位。如果高于256级灰阶，一般就采用16位。
  width: number;
  height: number;
  samplesPerPixel: number; // 每一个像素的取样数，一般来说，CT，MR，DR等灰度图像都是1，而彩超等彩**图像都是3，分别表示R, G, B三个颜色通道。
  rowPixelSpacing: number;
  columnPixelSpacing: number;
  // 缩放斜率和截距由硬件制造商决定。
  // 它指定从存储在磁盘表示中的像素到存储在内存表示中的像素的线性转换。磁盘存储的值定义为SV。而转化到内存中的像素值uints就需要两个dicom tag : Rescale intercept和Rescale slope。
  // OutputUnits=m∗SV+b
  // RescaleIntercept:b
  // RescaleSlope:m
  slope: number;
  intercept: number;
  invert: string;
  color: string;
  minPixelValue: number;
  maxPixelValue: number;
  windowCenter: number;
  windowWidth: number;
  instanceNumber: number;
  imageOrientationPatient: Array<number>;
  imagePositionPatient: Array<number>;
  sliceThickness: number;
  spacingBetweenSlices: number;
  imageCompression: string;
  studyDate: string;
  studyTime: string;
  seriesNum: string;
  accessionNumber: string;
  patientId: string;
  patientName: string;
  patientSex: string;
  patientAge: string;
}
