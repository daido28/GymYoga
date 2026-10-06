from pathlib import Path
import json, shutil, sys, zipfile

repo = Path('C:/WorkSpace/GymYogaHRM')
out = Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
proof = out / 'Minh_chung'
proof.mkdir(exist_ok=True)
results = []
for name in ('week5-integration.json', 'job-roster-integration.json', 'branches-integration.json', 'access-policy-integration.json', 'job-roster-ui.json', 'branches-ui.json', 'midnight-shifts.json', 'weekly-registration.json'):
    data = json.loads((repo / 'backend/test-results' / name).read_text(encoding='utf-8'))
    checks = data.get('checks', data.get('results'))
    assert checks is not None, name
    assert all(not isinstance(c, dict) or c.get('status') == 'PASS' for c in checks), name
    results.append({'file': name, 'status': 'PASS', 'total': data['total'], 'testedAtUTC': data['testedAt']})
    # Test fixtures are not part of the evidence delivered to the group.
    data.pop('demo', None)
    (proof / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
(proof / 'Tong_hop_kiem_thu.json').write_text(json.dumps({'database': 'GymYogaHRM_Week5_Test', 'total': sum(r['total'] for r in results), 'status': 'PASS', 'results': results, 'additionalLogicTests': 5}, ensure_ascii=False, indent=2), encoding='utf-8')
(out / 'PROMPT_VA_THAY_DOI.md').write_text('''# Yêu cầu và thay đổi ngày 06/10/2026

## Prompt của người dùng
“Tại sao nhân viên không thể đăng ký ca làm, tôi muốn nhân viên có thể đăng ký ca làm cho mỗi tuần không thể đăng ký cho 1 tháng, và admin có thể xếp lịch cho nhân viên nếu ngày đó còn thiếu nhân viên, vì hiện tại tôi đang làm đăng nhập bằng admin nhưng không thể thêm nhân viên vào lịch.”

## Vai trò AI và xử lý
AI hỗ trợ lập trình, phân tích nguyên nhân, kiểm tra API/giao diện và viết hướng dẫn. Thêm API đăng ký một tuần, giao diện chọn ca theo 7 ngày, bảo vệ danh tính/chi nhánh/sức chứa/chuyên môn/trùng giờ và transaction hoàn tác toàn bộ lần gửi khi lỗi. Thêm liên kết thiết lập công việc và chuyên môn ngay trong hộp phân công của Admin. Lịch đăng ký là bản nháp; quản lý kiểm tra rồi công bố khi đủ điều kiện.

Không tự suy đoán chuyên môn nhân viên hoặc nhu cầu công việc của ca trong database thật. Người quản lý thiết lập đúng thực tế theo HUONG_DAN.md. Không cần migration mới cho tính năng này.

## Kiểm thử
277 kiểm tra API/giao diện đạt, cộng 5 kiểm tra logic phân quyền đạt, trên database thử nghiệm riêng. 45 kiểm tra mới tập trung đăng ký tuần và luồng Admin thiết lập rồi phân công. Minh chứng là kiểm thử kỹ thuật cục bộ, không phải nghiệm thu của nhóm và không chứng minh Jira/GitHub/Notion đã hoàn thành.

Thời điểm trong JSON dùng UTC; ngày cập nhật tài liệu là 06/10/2026 theo giờ Việt Nam.
''', encoding='utf-8')
source = out / 'GymYogaHRM_MaNguon.zip'
with zipfile.ZipFile(source, 'w', zipfile.ZIP_DEFLATED) as z:
    for root in ('backend', 'frontend', 'database', 'docs'):
        for p in (repo / root).rglob('*'):
            if not p.is_file(): continue
            rel = p.relative_to(repo)
            if any(x in ('node_modules', '.git', '.codex', '__pycache__', 'test-results') for x in rel.parts): continue
            if p.name.startswith('.env') and p.name != '.env.example': continue
            if p.name == Path(__file__).name: continue
            z.write(p, rel.as_posix())
    for name in ('README.md', '.gitignore'):
        if (repo / name).is_file(): z.write(repo / name, name)
with zipfile.ZipFile(source) as z:
    assert not any(Path(n).name.startswith('.env') and Path(n).name != '.env.example' for n in z.namelist())
full = out.parent / 'GymYogaHRM_DangKyCaTheoTuan.zip'
with zipfile.ZipFile(full, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in out.rglob('*'):
        if p.is_file(): z.write(p, p.relative_to(out.parent).as_posix())
print('Delivery ready; API/UI checks:', sum(r['total'] for r in results), '; logic checks: 5')
