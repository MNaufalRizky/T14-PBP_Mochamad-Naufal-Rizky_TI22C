const request = require('supertest');
const app = require('../index');

describe('siswaController', () => {

    describe('GET /siswa', () => {
        test('should get list of siswa', async () => {
            const response = await request(app).get('/siswa');
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('status', true);
        });
    });

});

describe('POST /siswa', () => {
    test('should insert new siswa', async () => {
        const response = await request(app)
            .post('/siswa')
            .query({
                nama: 'Naufal',
                umur: 19,
                alamat: 'Jl Babakan Limusnunggal',
            });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('status', true);
    });
});

describe('Update Endpoint', () => {
    let insertedId;

    //Sebelum pengujian, tambahkan data siswa ke database untuk diubah
    beforeAll(async () => {
        const insertQuery =
            `INSERT INTO tbl_siswa (nama, umur, alamat) VALUES ('Annisa', 21, 'Tasik')`;
        const insertResult = await new Promise((resolve) => {
            conn.query(insertQuery, (err, result) => {
                if (err) {
                    console.error('Insert Error', err);
                }
                resolve(result);
            });
        });

        insertedId = insertResult.insertId;
    });

    //Setelah pengujian, hapus data yang telah diubah
    afterAll(async () => {
        const deleteQuery = `DELETE FROM tbl_siswa WHERE id = ${insertedId}`;
        await new Promise((resolve) => {
            conn.query(deleteQuery, () => {
                resolve();
            });
        });

        //conn.end(); // tutup koneksi database setelah semua pengujian selesai
    });

    //Pengujian untuk updateSiswa
    it('should update a student', async () => {
        const updatedData = {
            nama: 'Sky',
            umur: 19,
            alamat: 'Kabupaten Bogor'
        };

        const response =  await request(app)
            .put(`/siswa/${insertedId}`)
            .send(updatedData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('status', true);
        expect(response.body).toHaveProperty('msg', 'Successfull Updated');

        //Cek apakah data telah diubah di database
        const selectQuery = `SELECT * FROM tbl_siswa WHERE id = ${insertedId}`;
        const selectResult = await new Promise((resolve) => {
            conn.query(selectQuery, (err, result) => {
                resolve(result);
            });
        });

        expect(selectResult.length).toBe(1);
        expect(Array.isArray(selectResult)).toBe(true);
        expect(selectResult.length).toBeGreaterThan(0);
        expect(selectResult[0].nama == updatedData.nama);
        expect(selectResult[0].umur == updatedData.umur);
        expect(selectResult[0].alamat == updatedData.alamat);
    });
});

describe('siswaController - Delete', () => {
    let insertedId;

    //Sebelum pengujian, tambahkan data siswa ke database untuk dihapus
    beforeAll(async () => {
        const insertQuery =
            `INSERT INTO tbl_siswa (nama, umur, alamat) VALUES ('Test', 25, 'Jl. Test')`;
        const insertResult = await new Promise((resolve) => {
            conn.query(insertQuery, (err, result) => {
                if (err) {
                    console.error('Insert Error:', err);
                }
                insertedId = result.insertId;
                resolve();
            });
        });
    });

    //Pengujian untuk deleteSiswa
    it('should delete a student', async () => {
        const response = await request(app).delete(`/siswa/${insertedId}`);

        //Periksa resposn body sesuai dengan respons yang diharapkan
        if (response.body.status) {
            //Jika status true, maka respons harus berhasil
            expect(response.body).toHaveProperty('status', true);
            expect(response.body).toHaveProperty('msg', 'Delete Successfull');
        } else {
            //Jika status false, maka respons harus gagal
            expect(response.body).toHaveProperty('status', false);
            expect(response.body).toHaveProperty('msg', 'Delete Failed');
        }

        //pastikan data telah dihapus di database
        const selectQuery = `SELECT * FROM tbl_siswa WHERE id = ${insertedId}`;
        const selectResult = await new Promise((resolve) => {
            conn.query(selectQuery, (err, result) => {
                resolve(result);
            });
        });

        expect(selectResult.length).toBe(0);
    });

    //Setelah pengujian, tutup koneksi database
    afterAll(() => {
        conn.end();
    });
});