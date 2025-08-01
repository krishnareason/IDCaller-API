import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // This part automatically clears all old data
    await prisma.spamAlert.deleteMany();
    await prisma.userContact.deleteMany();
    await prisma.accountUser.deleteMany();
    console.log('Cleared previous data.');

    // --- EDIT YOUR MOCK DATA BELOW ---

    // 1. Add your custom users here
    const usersData = [
        { userName: 'Krishna Srivastava', userNumber: '9876543210', userPassword: await bcrypt.hash('krishna', 10), userEmail: 'krishna@demo.com' },
        { userName: 'Priya Patel', userNumber: '8765432109', userPassword: await bcrypt.hash('priya', 10), userEmail: 'priya@demo.com' },
        { userName: 'Amit Kumar', userNumber: '7654321098', userPassword: await bcrypt.hash('amit', 10), userEmail: 'amit@demo.com' },
        { userName: 'Banti Kumar', userNumber: '4321098765', userPassword: await bcrypt.hash('banti', 10), userEmail: 'banti@demo.com' },
        { userName: 'Akash Kumar', userNumber: '4321876509', userPassword: await bcrypt.hash('akash', 10), userEmail: 'akash@demo.com' },
        { userName: 'Subham Singh', userNumber: '1098765432', userPassword: await bcrypt.hash('subham', 10), userEmail: 'subham@demo.com' },
        { userName: 'Harsh Raj', userNumber: '9876105432', userPassword: await bcrypt.hash('harsh', 10), userEmail: 'harsh@demo.com' },
        { userName: 'Anubhaw Raj', userNumber: '8321097654', userPassword: await bcrypt.hash('anubhaw', 10), userEmail: 'anubhaw@demo.com' },
        { userName: 'Adishree', userNumber: '2107654398', userPassword: await bcrypt.hash('adi', 10), userEmail: 'adi@demo.com' },
        // ... add as many users as you want
    ];
    await prisma.accountUser.createMany({ data: usersData });
    console.log('Created custom users.');
    
    // Get the users you just created to link contacts and spam
    const createdUsers = await prisma.accountUser.findMany();

    // 2. Add your custom contacts here
    const contactsData = [
        // Make Krishna's contact list
        { userName: 'Sonia', userNumber: '1111111111', accountUserId: createdUsers[0].uniqueId },
        // Make Priya's contact list
        { userName: 'Vikram', userNumber: '2222222222', accountUserId: createdUsers[1].uniqueId },
         // ... add more contacts for any user
    ];
    await prisma.userContact.createMany({ data: contactsData });
    console.log('Created custom contacts.');

    // 3. Add your custom spam reports here
    const spamData = [
        // Make Krishna report a number
        { reportedNumber: '5555555555', accountUserId: createdUsers[0].uniqueId },
        // Make Priya report the same number
        { reportedNumber: '5555555555', accountUserId: createdUsers[1].uniqueId },
    ];
    await prisma.spamAlert.createMany({ data: spamData });
    console.log('Added custom spam reports.');
    
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });