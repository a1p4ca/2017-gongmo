const fs = require('fs')
const path = require('path')
const Router = require('express').Router
const archiver = require('archiver')
const router = new Router()
const Team = require('../src/db/Team')
const File = require('../src/db/File')
// const Notice = require('../src/db/Notice')

const config = require('../../config')

router.get('/', (req, res) => res.redirect('/admin/dashboard'))

router.route('/dashboard')
  .get((req, res) => {
    Team.getList().then(r => {
      res.render('admin/dashboard', {
        teams: r,
        user: req.user
      })
    }).catch(_ => {
      res.status(400)
      res.end()
    })
  })

router.route('/download')
  .get((req, res) => {
    const zip = path.join(__dirname, '../..', 'content/files/download.zip')
    const output = fs.createWriteStream(zip)
    const archive = archiver('zip')

    output.on('close', () => {
      res.download(zip)
    })

    archive.on('warning', err => {
      if (err.code === 'ENOENT') {
        console.warn(err)
      } else {
        throw err
      }
    })

    archive.on('error', err => {
      throw err
    })

    archive.pipe(output)
    ;(async () => {
      const teams = (await Team.getList()).filter(v => v.files.length > 0)
      const typeNames = {
        [File.TYPE.FORM_FILE]: '신청서',
        [File.TYPE.SOURCE_FILE]: '소스코드'
      }
      // 파일이 존재하면
      for (const team of teams) {
        // 파일을 가져옴
        const files = await File.findByLeaderSerial(team.leader.serial)
        // 소스파일 처리
        files.forEach(file => {
          if (!file) return
          archive.file(
            path.join(config.content, 'files', file.hash),
            {
              name: `${team.name}/[${team.name} - ${team.leader.serial} ${team.leader.name} ${typeNames[file.type]}] ${file.originalName}`
            }
          )
        })
      }
    })().then(() => {
      archive.finalize()
    }).catch(console.error)
  })

module.exports = router
