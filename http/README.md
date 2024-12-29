# HTTP Request Examples

This directory contains HTTP request examples for testing the Attendance Management API. You can use these files with REST Client extensions in VS Code or import them into Postman.

## Setup

1. Install REST Client extension in VS Code
2. Update the variables in each .http file:
   - @baseUrl: Your API base URL (default: http://localhost:3000)
   - @departmentId: Replace with actual department ID after creation
   - @employeeId: Replace with actual employee ID after creation
   - @shiftId: Replace with actual shift ID after creation
   - @timekeepingId: Replace with actual timekeeping record ID

## Files

- `auth.http`: Authentication related requests
- `department.http`: Department management requests
- `employee.http`: Employee management requests
- `shift.http`: Shift management requests
- `timekeeping.http`: Attendance tracking requests
- `qrcode.http`: QR code generation and validation requests

## Usage

1. Open any .http file
2. Click "Send Request" above each request
3. View response in the right panel

## Testing Flow

1. Create a department using `department.http`
2. Create an employee using `employee.http`
3. Create a shift using `shift.http`
4. Test timekeeping using `timekeeping.http`
5. Test QR code features using `qrcode.http`

## Notes

- Some endpoints require authentication (currently commented out)
- Replace placeholder IDs with actual IDs after creating resources
- Check response status and body for each request
- Use the appropriate Content-Type headers
