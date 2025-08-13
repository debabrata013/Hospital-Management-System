# 🔧 Database Connection Troubleshooting Guide
## MySQL Connection Issues - Hostinger Database

---

## 🚨 **Current Issue:**
```
❌ Access denied for user 'admin'@'122.15.65.67' (using password: YES)
```

## 📊 **Connection Details:**
- **Database**: `u153229971_Hospital`
- **Username**: `admin`
- **Password**: `Admin!2025`
- **Host**: `srv2047.hstgr.io` / `148.222.53.8`
- **Port**: `3306`
- **Your IP**: `122.15.65.67` (detected from error)

---

## 🔍 **Troubleshooting Steps:**

### **Step 1: Verify Database User in Hostinger**

Please check in your Hostinger Control Panel:

1. **Go to Database → MySQL Databases**
2. **Check if user `admin` exists**
3. **Verify the password is exactly**: `Admin!2025`
4. **Ensure user has ALL PRIVILEGES on**: `u153229971_Hospital`

### **Step 2: Check Remote Access Settings**

In Hostinger Control Panel:

1. **Go to Database → Remote MySQL**
2. **Verify entry exists**:
   - **Database**: `u153229971_Hospital`
   - **Access Host**: `%` (or add specific IP: `122.15.65.67`)

### **Step 3: Test Connection Manually**

Try connecting via command line:

```bash
# Test 1: Using hostname
mysql -h srv2047.hstgr.io -P 3306 -u admin -p u153229971_Hospital

# Test 2: Using IP address
mysql -h 148.222.53.8 -P 3306 -u admin -p u153229971_Hospital
```

When prompted, enter password: `Admin!2025`

### **Step 4: Alternative Connection Methods**

#### **Option A: Use phpMyAdmin**
1. Login to Hostinger Control Panel
2. Go to Database → phpMyAdmin
3. Try to access `u153229971_Hospital` database
4. This will confirm if the database and user work

#### **Option B: Create Different User**
If the current user doesn't work, create a new one:
- **Username**: `hospital_admin`
- **Password**: `HospitalAdmin2025` (no special characters)
- **Privileges**: ALL on `u153229971_Hospital`

---

## 🔧 **Common Solutions:**

### **Solution 1: Password Issues**
The `!` character in `Admin!2025` might be causing issues. Try:
- **New Password**: `Admin2025` (without special characters)
- **Or**: `AdminPass2025`

### **Solution 2: IP Address Issues**
Your IP seems to be changing (`122.15.65.67` vs `182.72.101.29`). Solutions:
- Add both IPs to Remote MySQL access
- Use `%` (any host) for testing
- Check if you're behind a proxy/VPN

### **Solution 3: User Privileges**
Ensure the user has these specific privileges:
- SELECT, INSERT, UPDATE, DELETE
- CREATE, DROP, ALTER
- INDEX, REFERENCES

---

## 🚀 **Quick Fix Options:**

### **Option 1: Simplify Credentials**
Let's try simpler credentials:
- **Username**: `root` or `hospital`
- **Password**: `Hospital123` (simple, no special chars)

### **Option 2: Use Default Database User**
Check if there's a default user that comes with the database:
- Look for users like `u153229971_admin` or similar
- These often have the format: `{database_prefix}_{username}`

### **Option 3: Contact Hostinger Support**
If nothing works:
1. Contact Hostinger support
2. Ask them to verify:
   - Database user exists and has correct password
   - Remote access is properly configured
   - No firewall blocking the connection

---

## 🧪 **Testing Commands:**

Once you fix the user/password issue, run these:

```bash
# Test connection
npm run db:test:simple

# Create database schema
mysql -h srv2047.hstgr.io -u admin -p u153229971_Hospital < database/mysql-schema.sql
mysql -h srv2047.hstgr.io -u admin -p u153229971_Hospital < database/mysql-schema-part2.sql
mysql -h srv2047.hstgr.io -u admin -p u153229971_Hospital < database/mysql-schema-part3.sql

# Create admin user and test APIs
npm run db:create-admin:sample
npm run dev
npm run test:apis
```

---

## 📋 **Checklist:**

- [ ] Database user `admin` exists in Hostinger
- [ ] Password is exactly `Admin!2025`
- [ ] User has ALL PRIVILEGES on `u153229971_Hospital`
- [ ] Remote access shows `%` or specific IP `122.15.65.67`
- [ ] Manual connection via command line works
- [ ] phpMyAdmin access works

---

## 🎯 **Next Steps:**

1. **Verify the database user exists and has correct password**
2. **Test manual connection via command line**
3. **If still failing, try creating a new user with simpler password**
4. **Once connection works, we can proceed with schema creation**

The migration is 99% complete - we just need to resolve this database authentication issue! 🚀
