// Seed data for demo - users, cases, and assignments
import { v4 as uuid } from 'uuid';

// Seed Assignments với đầy đủ thông tin
export interface SeedAssignment {
  userId: string;
  userName: string;
  role: 'truong-nhom' | 'thanh-vien';
  taskTemplateId: string;
  taskTemplateName: string;
  tasks: SeedTask[];
  assignedAt: Date;
  assignedBy: string;
}

export interface SeedTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
}

export interface SeedMember {
  userId: string;
  role: 'truong-nhom' | 'thanh-vien';
  joinedAt: Date;
  isActive: boolean;
}

export interface SeedCaseTemplate {
  id: string;
  templateId: string;
  templateName: string;
  addedAt: Date;
  addedBy: string;
}

export interface SeedCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'moi' | 'dang-xu-ly' | 'hoan-thanh';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  assignments: SeedAssignment[];
  members: SeedMember[];
  channelId: string;
  report?: string;
  caseTemplates: SeedCaseTemplate[];
}

// Demo Cases với phân công thực tế
export const SEED_CASES: SeedCase[] = [
  {
    id: uuid(),
    caseNumber: 'VA-2026-001',
    title: 'Vụ trộm cắp tại cửa hàng tiện lợi Ngõ 5',
    description: 'Tối ngày 14/08/2026, tại cửa hàng tiện lợi ABC Mart, Ngõ 5 Phố Huế, phát hiện kẻ gian đột nhập qua cửa sổ phía sau. Camera an ninh ghi lại thời gian xảy ra từ 23:30 đến 00:15. Tài sản mất: 15 triệu đồng tiền mặt, 50 thẻ cào điện thoại. Vụ việc có dấu hiệu bạo lực - khóa cửa bị phá hỏng.',
    priority: 'high',
    status: 'dang-xu-ly',
    createdBy: 'lead-001',
    createdAt: new Date('2026-08-15T08:00:00'),
    updatedAt: new Date('2026-08-15T10:30:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [
      {
        userId: 'member-001',
        userName: 'Phạm Văn C',
        role: 'thanh-vien',
        taskTemplateId: 'kham-nghiem',
        taskTemplateName: 'Khám nghiệm hiện trường',
        assignedAt: new Date('2026-08-15T08:10:00'),
        assignedBy: 'lead-001',
        tasks: [
          { id: uuid(), title: 'Bảo vệ hiện trường', description: 'Đảm bảo hiện trường không bị xáo trộn', priority: 'high', estimatedTime: '15 phút', required: true, completed: true, completedAt: new Date('2026-08-15T08:30:00') },
          { id: uuid(), title: 'Chụp ảnh toàn cảnh', description: 'Chụp ảnh tổng quan từ nhiều góc', priority: 'high', estimatedTime: '10 phút', required: true, completed: true, completedAt: new Date('2026-08-15T08:45:00') },
          { id: uuid(), title: 'Thu thập dấu vết', description: 'Thu thập vân tay, DNA và các dấu vết', priority: 'high', estimatedTime: '45 phút', required: true, completed: true, completedAt: new Date('2026-08-15T09:30:00') },
          { id: uuid(), title: 'Đo đạc sơ đồ', description: 'Vẽ sơ đồ vị trí các vật chứng', priority: 'medium', estimatedTime: '20 phút', required: true, completed: false },
          { id: uuid(), title: 'Lập biên bản', description: 'Ghi chép và lập biên bản hiện trường', priority: 'high', estimatedTime: '20 phút', required: true, completed: false },
          { id: uuid(), title: 'Bàn giao chứng cứ', description: 'Bàn giao vật chứng cho phòng giám định', priority: 'medium', estimatedTime: '15 phút', required: false, completed: false },
        ]
      },
      {
        userId: 'member-002',
        userName: 'Hoàng Thị D',
        role: 'thanh-vien',
        taskTemplateId: 'tra-camera',
        taskTemplateName: 'Trích xuất camera',
        assignedAt: new Date('2026-08-15T08:15:00'),
        assignedBy: 'lead-001',
        tasks: [
          { id: uuid(), title: 'Xác định vị trí camera', description: 'Liệt kê camera trong bán kính 500m', priority: 'high', estimatedTime: '10 phút', required: true, completed: true, completedAt: new Date('2026-08-15T08:20:00') },
          { id: uuid(), title: 'Truy cập hệ thống', description: 'Liên hệ và truy cập hệ thống camera', priority: 'high', estimatedTime: '15 phút', required: true, completed: true, completedAt: new Date('2026-08-15T09:00:00') },
          { id: uuid(), title: 'Trích xuất footage', description: 'Sao chép footage trong khung giờ liên quan', priority: 'high', estimatedTime: '30 phút', required: true, completed: true, completedAt: new Date('2026-08-15T09:30:00') },
          { id: uuid(), title: 'Phân tích thời gian', description: 'Xác định đối tượng, thời gian, hành vi', priority: 'high', estimatedTime: '60 phút', required: true, completed: false },
          { id: uuid(), title: 'Lưu bằng chứng', description: 'Lưu trữ footage có liên quan', priority: 'medium', estimatedTime: '20 phút', required: false, completed: false },
        ]
      }
    ],
    members: [
      { userId: 'lead-001', role: 'truong-nhom', joinedAt: new Date('2026-08-15T08:00:00'), isActive: true },
      { userId: 'member-001', role: 'thanh-vien', joinedAt: new Date('2026-08-15T08:10:00'), isActive: true },
      { userId: 'member-002', role: 'thanh-vien', joinedAt: new Date('2026-08-15T08:15:00'), isActive: true },
    ]
  },
  {
    id: uuid(),
    caseNumber: 'VA-2026-002',
    title: 'Vụ tai nạn giao thông nghiêm trọng QL1A',
    description: 'Ngày 13/08/2026, khoảng 18:30, tại Km 45+200 Quốc lộ 1A, xảy ra vụ tai nạn giao thông giữa xe tải và xe khách 45 chỗ. Nguyên nhân ban đầu: xe tải lấn làn đâm trực diện vào xe khách. Hậu quả: 3 người chết tại chỗ, 12 người bị thương được đưa đi cấp cứu. Hiện trường có nhiều mảnh vỡ, vết phanh dài 35m.',
    priority: 'high',
    status: 'dang-xu-ly',
    createdBy: 'lead-002',
    createdAt: new Date('2026-08-14T19:00:00'),
    updatedAt: new Date('2026-08-15T07:00:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [
      {
        userId: 'member-001',
        userName: 'Phạm Văn C',
        role: 'truong-nhom',
        taskTemplateId: 'kham-nghiem',
        taskTemplateName: 'Khám nghiệm hiện trường',
        assignedAt: new Date('2026-08-14T19:05:00'),
        assignedBy: 'lead-002',
        tasks: [
          { id: uuid(), title: 'Bảo vệ hiện trường', description: 'Đảm bảo hiện trường không bị xáo trộn', priority: 'high', estimatedTime: '15 phút', required: true, completed: true, completedAt: new Date('2026-08-14T19:30:00') },
          { id: uuid(), title: 'Chụp ảnh toàn cảnh', description: 'Chụp ảnh tổng quan từ nhiều góc', priority: 'high', estimatedTime: '10 phút', required: true, completed: true, completedAt: new Date('2026-08-14T19:45:00') },
          { id: uuid(), title: 'Thu thập dấu vết', description: 'Thu thập vân tay, DNA và các dấu vết', priority: 'high', estimatedTime: '45 phút', required: true, completed: true, completedAt: new Date('2026-08-14T21:00:00') },
          { id: uuid(), title: 'Đo đạc sơ đồ', description: 'Vẽ sơ đồ vị trí các vật chứng', priority: 'medium', estimatedTime: '20 phút', required: true, completed: true, completedAt: new Date('2026-08-14T20:10:00') },
          { id: uuid(), title: 'Lập biên bản', description: 'Ghi chép và lập biên bản hiện trường', priority: 'high', estimatedTime: '20 phút', required: true, completed: true, completedAt: new Date('2026-08-14T21:30:00') },
          { id: uuid(), title: 'Bàn giao chứng cứ', description: 'Bàn giao vật chứng cho phòng giám định', priority: 'medium', estimatedTime: '15 phút', required: false, completed: false },
        ]
      }
    ],
    members: [
      { userId: 'lead-002', role: 'truong-nhom', joinedAt: new Date('2026-08-14T19:00:00'), isActive: true },
      { userId: 'member-001', role: 'truong-nhom', joinedAt: new Date('2026-08-14T19:05:00'), isActive: true },
    ]
  },
  {
    id: uuid(),
    caseNumber: 'VA-2026-003',
    title: 'Vụ hỏa hoạn tại xưởng gỗ Thành Đạt',
    description: 'Sáng ngày 12/08/2026, khoảng 06:45, phát hiện cháy tại xưởng gỗ Thành Đạt, KCN Phố Nối A, huyện Văn Lâm, Hưng Yên. Lửa bùng phát nhanh do có nhiều vật liệu dễ cháy. Đám cháy được dập tắt sau 3 giờ với sự tham gia của 8 xe cứu hỏa. Thiệt hại: ước tính 8 tỷ đồng thiệt hại tài sản. Nguyên nhân đang được điều tra.',
    priority: 'high',
    status: 'hoan-thanh',
    createdBy: 'lead-001',
    createdAt: new Date('2026-08-12T07:30:00'),
    updatedAt: new Date('2026-08-14T16:00:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [
      {
        userId: 'member-001',
        userName: 'Phạm Văn C',
        role: 'truong-nhom',
        taskTemplateId: 'kham-nghiem',
        taskTemplateName: 'Khám nghiệm hiện trường',
        assignedAt: new Date('2026-08-12T07:35:00'),
        assignedBy: 'lead-001',
        tasks: [
          { id: uuid(), title: 'Bảo vệ hiện trường', description: 'Đảm bảo hiện trường không bị xáo trộn', priority: 'high', estimatedTime: '15 phút', required: true, completed: true, completedAt: new Date('2026-08-12T08:00:00') },
          { id: uuid(), title: 'Chụp ảnh toàn cảnh', description: 'Chụp ảnh tổng quan từ nhiều góc', priority: 'high', estimatedTime: '10 phút', required: true, completed: true, completedAt: new Date('2026-08-12T08:15:00') },
          { id: uuid(), title: 'Thu thập dấu vết', description: 'Thu thập vân tay, DNA và các dấu vết', priority: 'high', estimatedTime: '45 phút', required: true, completed: true, completedAt: new Date('2026-08-12T09:30:00') },
          { id: uuid(), title: 'Đo đạc sơ đồ', description: 'Vẽ sơ đồ vị trí các vật chứng', priority: 'medium', estimatedTime: '20 phút', required: true, completed: true, completedAt: new Date('2026-08-12T08:40:00') },
          { id: uuid(), title: 'Lập biên bản', description: 'Ghi chép và lập biên bản hiện trường', priority: 'high', estimatedTime: '20 phút', required: true, completed: true, completedAt: new Date('2026-08-12T10:15:00') },
          { id: uuid(), title: 'Bàn giao chứng cứ', description: 'Bàn giao vật chứng cho phòng giám định', priority: 'medium', estimatedTime: '15 phút', required: false, completed: true, completedAt: new Date('2026-08-12T10:30:00') },
        ]
      },
      {
        userId: 'member-004',
        userName: 'Đặng Thị F',
        role: 'thanh-vien',
        taskTemplateId: 'phan-tich',
        taskTemplateName: 'Phân tích tổng hợp',
        assignedAt: new Date('2026-08-12T08:00:00'),
        assignedBy: 'lead-001',
        tasks: [
          { id: uuid(), title: 'Thu thập thông tin', description: 'Thu thập tất cả thông tin liên quan', priority: 'high', estimatedTime: '45 phút', required: true, completed: true, completedAt: new Date('2026-08-13T14:00:00') },
          { id: uuid(), title: 'Phân tích liên kết', description: 'Tìm mối liên hệ giữa các chứng cứ', priority: 'high', estimatedTime: '60 phút', required: true, completed: true, completedAt: new Date('2026-08-13T15:00:00') },
          { id: uuid(), title: 'Xây dựng timeline', description: 'Xây dựng timeline các sự kiện', priority: 'medium', estimatedTime: '30 phút', required: true, completed: true, completedAt: new Date('2026-08-14T09:00:00') },
          { id: uuid(), title: 'Báo cáo tổng hợp', description: 'Viết báo cáo phân tích tổng hợp', priority: 'high', estimatedTime: '45 phút', required: true, completed: true, completedAt: new Date('2026-08-14T10:00:00') },
        ]
      }
    ],
    members: [
      { userId: 'lead-001', role: 'truong-nhom', joinedAt: new Date('2026-08-12T07:30:00'), isActive: true },
      { userId: 'member-001', role: 'truong-nhom', joinedAt: new Date('2026-08-12T07:35:00'), isActive: true },
      { userId: 'member-004', role: 'thanh-vien', joinedAt: new Date('2026-08-12T08:00:00'), isActive: true },
    ]
  },
  {
    id: uuid(),
    caseNumber: 'VA-2026-004',
    title: 'Vụ mất trộm tại quán cafe Nhà Đường',
    description: 'Đêm 10/08/2026, quán cafe Nhà Đường, 145 Cầu Giấy bị đột nhập. Kẻ gian phá khóa cửa sau, lấy đi 1 máy tính xách tay, 2 điện thoại và khoảng 3 triệu tiền mặt. Camera ghi lại đối tượng đeo mũ bảo hiểm, cao khoảng 1m65. Vụ việc xảy ra khoảng 02:30.',
    priority: 'medium',
    status: 'dang-xu-ly',
    createdBy: 'lead-002',
    createdAt: new Date('2026-08-11T08:00:00'),
    updatedAt: new Date('2026-08-11T10:00:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [
      {
        userId: 'member-006',
        userName: 'Trịnh Thị H',
        role: 'thanh-vien',
        taskTemplateId: 'tra-camera',
        taskTemplateName: 'Trích xuất camera',
        assignedAt: new Date('2026-08-11T08:10:00'),
        assignedBy: 'lead-002',
        tasks: [
          { id: uuid(), title: 'Xác định vị trí camera', description: 'Liệt kê camera trong bán kính 500m', priority: 'high', estimatedTime: '10 phút', required: true, completed: true, completedAt: new Date('2026-08-11T08:30:00') },
          { id: uuid(), title: 'Truy cập hệ thống', description: 'Liên hệ và truy cập hệ thống camera', priority: 'high', estimatedTime: '15 phút', required: true, completed: true, completedAt: new Date('2026-08-11T09:00:00') },
          { id: uuid(), title: 'Trích xuất footage', description: 'Sao chép footage trong khung giờ liên quan', priority: 'high', estimatedTime: '30 phút', required: true, completed: true, completedAt: new Date('2026-08-11T09:30:00') },
          { id: uuid(), title: 'Phân tích thời gian', description: 'Xác định đối tượng, thời gian, hành vi', priority: 'high', estimatedTime: '60 phút', required: true, completed: false },
          { id: uuid(), title: 'Lưu bằng chứng', description: 'Lưu trữ footage có liên quan', priority: 'medium', estimatedTime: '20 phút', required: false, completed: false },
        ]
      }
    ],
    members: [
      { userId: 'lead-002', role: 'truong-nhom', joinedAt: new Date('2026-08-11T08:00:00'), isActive: true },
      { userId: 'member-006', role: 'thanh-vien', joinedAt: new Date('2026-08-11T08:10:00'), isActive: true },
    ]
  },
  {
    id: uuid(),
    caseNumber: 'VA-2026-005',
    title: 'Vụ đánh nhau tại quán nhậu phố Tây',
    description: 'Đêm 09/08/2026, tại quán nhậu 78 Láng Hạ, xảy ra vụ đánh nhóm gây thương tích. Có 5 người bị thương, trong đó 2 người bị thương nặng. Nguyên nhân: mâu thuẫn từ game online. Các nạn nhân đã được đưa đi cấp cứu tại Bệnh viện Bạch Mai.',
    priority: 'high',
    status: 'dang-xu-ly',
    createdBy: 'lead-001',
    createdAt: new Date('2026-08-10T00:30:00'),
    updatedAt: new Date('2026-08-10T09:00:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [
      {
        userId: 'member-001',
        userName: 'Phạm Văn C',
        role: 'truong-nhom',
        taskTemplateId: 'kham-nghiem',
        taskTemplateName: 'Khám nghiệm hiện trường',
        assignedAt: new Date('2026-08-10T00:35:00'),
        assignedBy: 'lead-001',
        tasks: [
          { id: uuid(), title: 'Bảo vệ hiện trường', description: 'Đảm bảo hiện trường không bị xáo trộn', priority: 'high', estimatedTime: '15 phút', required: true, completed: true, completedAt: new Date('2026-08-10T01:00:00') },
          { id: uuid(), title: 'Chụp ảnh toàn cảnh', description: 'Chụp ảnh tổng quan từ nhiều góc', priority: 'high', estimatedTime: '10 phút', required: true, completed: true, completedAt: new Date('2026-08-10T01:15:00') },
          { id: uuid(), title: 'Thu thập dấu vết', description: 'Thu thập vân tay, DNA và các dấu vết', priority: 'high', estimatedTime: '45 phút', required: true, completed: true, completedAt: new Date('2026-08-10T02:30:00') },
          { id: uuid(), title: 'Đo đạc sơ đồ', description: 'Vẽ sơ đồ vị trí các vật chứng', priority: 'medium', estimatedTime: '20 phút', required: true, completed: true, completedAt: new Date('2026-08-10T01:40:00') },
          { id: uuid(), title: 'Lập biên bản', description: 'Ghi chép và lập biên bản hiện trường', priority: 'high', estimatedTime: '20 phút', required: true, completed: true, completedAt: new Date('2026-08-10T03:05:00') },
          { id: uuid(), title: 'Bàn giao chứng cứ', description: 'Bàn giao vật chứng cho phòng giám định', priority: 'medium', estimatedTime: '15 phút', required: false, completed: false },
        ]
      },
      {
        userId: 'member-004',
        userName: 'Đặng Thị F',
        role: 'thanh-vien',
        taskTemplateId: 'tham-van',
        taskTemplateName: 'Thẩm vấn',
        assignedAt: new Date('2026-08-10T08:00:00'),
        assignedBy: 'lead-001',
        tasks: [
          { id: uuid(), title: 'Chuẩn bị câu hỏi', description: 'Nghiên cứu hồ sơ và chuẩn bị câu hỏi', priority: 'high', estimatedTime: '30 phút', required: true, completed: true, completedAt: new Date('2026-08-10T10:00:00') },
          { id: uuid(), title: 'Thẩm vấn', description: 'Tiến hành thẩm vấn theo quy trình', priority: 'high', estimatedTime: '60 phút', required: true, completed: true, completedAt: new Date('2026-08-10T11:00:00') },
          { id: uuid(), title: 'Ghi chép nội dung', description: 'Ghi chép đầy đủ nội dung lời khai', priority: 'high', estimatedTime: '30 phút', required: true, completed: false },
          { id: uuid(), title: 'Lập biên bản', description: 'Hoàn thiện biên bản thẩm vấn', priority: 'medium', estimatedTime: '20 phút', required: true, completed: false },
        ]
      }
    ],
    members: [
      { userId: 'lead-001', role: 'truong-nhom', joinedAt: new Date('2026-08-10T00:30:00'), isActive: true },
      { userId: 'member-001', role: 'truong-nhom', joinedAt: new Date('2026-08-10T00:35:00'), isActive: true },
      { userId: 'member-004', role: 'thanh-vien', joinedAt: new Date('2026-08-10T08:00:00'), isActive: true },
    ]
  },
  {
    id: uuid(),
    caseNumber: 'VA-2026-006',
    title: 'Vụ trộm xe máy tại bãi đỗ Vinmart',
    description: 'Ngày 08/08/2026, chị Nguyễn Thị Hương (32 tuổi) trình báo mất xe máy Honda Lead tại bãi đỗ Vinmart Cầu Giấy. Xe đỗ lúc 14:00, phát hiện mất lúc 17:30. Camera bãi đỗ ghi lại thời điểm một nam giới đội mũ bảo hiểm dắt xe đi lúc 16:20.',
    priority: 'medium',
    status: 'dang-xu-ly',
    createdBy: 'lead-002',
    createdAt: new Date('2026-08-09T10:00:00'),
    updatedAt: new Date('2026-08-09T12:00:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [
      {
        userId: 'member-002',
        userName: 'Hoàng Thị D',
        role: 'thanh-vien',
        taskTemplateId: 'tra-camera',
        taskTemplateName: 'Trích xuất camera',
        assignedAt: new Date('2026-08-09T10:05:00'),
        assignedBy: 'lead-002',
        tasks: [
          { id: uuid(), title: 'Xác định vị trí camera', description: 'Liệt kê camera trong bán kính 500m', priority: 'high', estimatedTime: '10 phút', required: true, completed: true, completedAt: new Date('2026-08-09T10:30:00') },
          { id: uuid(), title: 'Truy cập hệ thống', description: 'Liên hệ và truy cập hệ thống camera', priority: 'high', estimatedTime: '15 phút', required: true, completed: true, completedAt: new Date('2026-08-09T11:00:00') },
          { id: uuid(), title: 'Trích xuất footage', description: 'Sao chép footage trong khung giờ liên quan', priority: 'high', estimatedTime: '30 phút', required: true, completed: true, completedAt: new Date('2026-08-09T11:30:00') },
          { id: uuid(), title: 'Phân tích thời gian', description: 'Xác định đối tượng, thời gian, hành vi', priority: 'high', estimatedTime: '60 phút', required: true, completed: false },
          { id: uuid(), title: 'Lưu bằng chứng', description: 'Lưu trữ footage có liên quan', priority: 'medium', estimatedTime: '20 phút', required: false, completed: false },
        ]
      }
    ],
    members: [
      { userId: 'lead-002', role: 'truong-nhom', joinedAt: new Date('2026-08-09T10:00:00'), isActive: true },
      { userId: 'member-002', role: 'thanh-vien', joinedAt: new Date('2026-08-09T10:05:00'), isActive: true },
    ]
  },
  {
    id: uuid(),
    caseNumber: 'VA-2026-007',
    title: 'Vụ xâm hại dữ liệu tại công ty ABC Corp',
    description: 'Ngày 07/08/2026, công ty ABC Corp tố cáo một nhân viên cũ đã xâm nhập hệ thống máy tính công ty, sao chép dữ liệu khách hàng và bán cho đối thủ. Thiệt hại ước tính 15 tỷ đồng. Đối tượng đã nghỉ việc tháng 6/2026. Cần điều tra về tội vi phạm bảo mật dữ liệu.',
    priority: 'high',
    status: 'moi',
    createdBy: 'lead-001',
    createdAt: new Date('2026-08-08T09:00:00'),
    updatedAt: new Date('2026-08-08T09:00:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [],
    members: [
      { userId: 'lead-001', role: 'truong-nhom', joinedAt: new Date('2026-08-08T09:00:00'), isActive: true },
    ]
  },
  {
    id: uuid(),
    caseNumber: 'VA-2026-008',
    title: 'Vụ ma túy tại quán bar Sunset',
    description: 'Tối 06/08/2026, tổ công tác phát hiện quán bar Sunset, 56 Đông Các có dấu hiệu mua bán và sử dụng ma túy. Tang vật thu giữ: 50 viên ecstasy, 20g cocaine, 5 bình khí N2O. Có 23 đối tượng tại quán, 8 người có kết quả test dương tính.',
    priority: 'high',
    status: 'dang-xu-ly',
    createdBy: 'lead-002',
    createdAt: new Date('2026-08-07T00:00:00'),
    updatedAt: new Date('2026-08-07T08:00:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [
      {
        userId: 'member-004',
        userName: 'Đặng Thị F',
        role: 'truong-nhom',
        taskTemplateId: 'phan-tich',
        taskTemplateName: 'Phân tích tổng hợp',
        assignedAt: new Date('2026-08-07T01:00:00'),
        assignedBy: 'lead-002',
        tasks: [
          { id: uuid(), title: 'Thu thập thông tin', description: 'Thu thập tất cả thông tin liên quan', priority: 'high', estimatedTime: '45 phút', required: true, completed: true, completedAt: new Date('2026-08-07T02:00:00') },
          { id: uuid(), title: 'Phân tích liên kết', description: 'Tìm mối liên hệ giữa các chứng cứ', priority: 'high', estimatedTime: '60 phút', required: true, completed: true, completedAt: new Date('2026-08-07T03:00:00') },
          { id: uuid(), title: 'Xây dựng timeline', description: 'Xây dựng timeline các sự kiện', priority: 'medium', estimatedTime: '30 phút', required: true, completed: true, completedAt: new Date('2026-08-07T04:00:00') },
          { id: uuid(), title: 'Báo cáo tổng hợp', description: 'Viết báo cáo phân tích tổng hợp', priority: 'high', estimatedTime: '45 phút', required: true, completed: false },
        ]
      }
    ],
    members: [
      { userId: 'lead-002', role: 'truong-nhom', joinedAt: new Date('2026-08-07T00:00:00'), isActive: true },
      { userId: 'member-004', role: 'truong-nhom', joinedAt: new Date('2026-08-07T01:00:00'), isActive: true },
    ]
  },
  {
    id: uuid(),
    caseNumber: 'VA-2026-009',
    title: 'Vụ giết người tại chung cư Green House',
    description: 'Ngày 05/08/2026, phát hiện thi thể anh Nguyễn Văn Minh (45 tuổi) tại căn hộ 1504, chung cư Green House, Mỹ Đình. Nạn nhân tử vong do bị đâm nhiều nhát dao. Vợ nạn nhân khai vắng nhà từ 21:00 ngày 04/08 đến sáng 05/08 thì phát hiện. Căn hộ có dấu hiệu bị lục soát, tivi và máy tính bị mất.',
    priority: 'high',
    status: 'dang-xu-ly',
    createdBy: 'lead-001',
    createdAt: new Date('2026-08-05T07:00:00'),
    updatedAt: new Date('2026-08-05T14:00:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [
      {
        userId: 'member-005',
        userName: 'Bùi Văn G',
        role: 'truong-nhom',
        taskTemplateId: 'kham-nghiem',
        taskTemplateName: 'Khám nghiệm hiện trường',
        assignedAt: new Date('2026-08-05T07:05:00'),
        assignedBy: 'lead-001',
        tasks: [
          { id: uuid(), title: 'Bảo vệ hiện trường', description: 'Đảm bảo hiện trường không bị xáo trộn', priority: 'high', estimatedTime: '15 phút', required: true, completed: true, completedAt: new Date('2026-08-05T07:30:00') },
          { id: uuid(), title: 'Chụp ảnh toàn cảnh', description: 'Chụp ảnh tổng quan từ nhiều góc', priority: 'high', estimatedTime: '10 phút', required: true, completed: true, completedAt: new Date('2026-08-05T07:45:00') },
          { id: uuid(), title: 'Thu thập dấu vết', description: 'Thu thập vân tay, DNA và các dấu vết', priority: 'high', estimatedTime: '45 phút', required: true, completed: true, completedAt: new Date('2026-08-05T09:00:00') },
          { id: uuid(), title: 'Đo đạc sơ đồ', description: 'Vẽ sơ đồ vị trí các vật chứng', priority: 'medium', estimatedTime: '20 phút', required: true, completed: true, completedAt: new Date('2026-08-05T08:10:00') },
          { id: uuid(), title: 'Lập biên bản', description: 'Ghi chép và lập biên bản hiện trường', priority: 'high', estimatedTime: '20 phút', required: true, completed: true, completedAt: new Date('2026-08-05T09:45:00') },
          { id: uuid(), title: 'Bàn giao chứng cứ', description: 'Bàn giao vật chứng cho phòng giám định', priority: 'medium', estimatedTime: '15 phút', required: false, completed: true, completedAt: new Date('2026-08-05T10:00:00') },
        ]
      },
      {
        userId: 'member-006',
        userName: 'Trịnh Thị H',
        role: 'thanh-vien',
        taskTemplateId: 'tra-camera',
        taskTemplateName: 'Trích xuất camera',
        assignedAt: new Date('2026-08-05T07:10:00'),
        assignedBy: 'lead-001',
        tasks: [
          { id: uuid(), title: 'Xác định vị trí camera', description: 'Liệt kê camera trong bán kính 500m', priority: 'high', estimatedTime: '10 phút', required: true, completed: true, completedAt: new Date('2026-08-05T08:00:00') },
          { id: uuid(), title: 'Truy cập hệ thống', description: 'Liên hệ và truy cập hệ thống camera', priority: 'high', estimatedTime: '15 phút', required: true, completed: true, completedAt: new Date('2026-08-05T08:30:00') },
          { id: uuid(), title: 'Trích xuất footage', description: 'Sao chép footage trong khung giờ liên quan', priority: 'high', estimatedTime: '30 phút', required: true, completed: true, completedAt: new Date('2026-08-05T09:00:00') },
          { id: uuid(), title: 'Phân tích thời gian', description: 'Xác định đối tượng, thời gian, hành vi', priority: 'high', estimatedTime: '60 phút', required: true, completed: true, completedAt: new Date('2026-08-05T11:00:00') },
          { id: uuid(), title: 'Lưu bằng chứng', description: 'Lưu trữ footage có liên quan', priority: 'medium', estimatedTime: '20 phút', required: false, completed: true, completedAt: new Date('2026-08-05T11:30:00') },
        ]
      }
    ],
    members: [
      { userId: 'lead-001', role: 'truong-nhom', joinedAt: new Date('2026-08-05T07:00:00'), isActive: true },
      { userId: 'member-005', role: 'truong-nhom', joinedAt: new Date('2026-08-05T07:05:00'), isActive: true },
      { userId: 'member-006', role: 'thanh-vien', joinedAt: new Date('2026-08-05T07:10:00'), isActive: true },
    ]
  },
  {
    id: uuid(),
    caseNumber: 'VA-2026-010',
    title: 'Vụ cướp tài sản trên đường Láng',
    description: 'Tối 04/08/2026, anh Trần Đức Anh (28 tuổi) trình báo bị 2 đối tượng đi xe máy cướp túi xách trên đường Láng, đoạn gần ngã tư Láng - Trung Kính. Nạn nhân bị kéo ngã, xây xước nhẹ. Mất: túi xách chứa 5 triệu đồng, điện thoại iPhone 15, giấy tờ tùy thân.',
    priority: 'medium',
    status: 'moi',
    createdBy: 'lead-001',
    createdAt: new Date('2026-08-05T21:00:00'),
    updatedAt: new Date('2026-08-05T21:00:00'),
    channelId: `channel-${uuid()}`,
    caseTemplates: [],
    assignments: [],
    members: [
      { userId: 'lead-001', role: 'truong-nhom', joinedAt: new Date('2026-08-05T21:00:00'), isActive: true },
    ]
  }
];
