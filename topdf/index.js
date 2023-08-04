const autoBind = require("auto-bind")
const puppeteer = require("puppeteer")
const Server = require("./server")

class HTML5ToPDF {
  constructor(options) {
    this.options = this.parseOptions(options)
    autoBind(this)
  }

  parseOptions(options) {
    const {
      inputPath,
      outputPath,
      launchOptions,
      pdfOptions,
      renderDelay
    } = options

    const pdf = pdfOptions
    pdf.path = outputPath

    return {
      pdf,
      launchOptions,
      inputPath,
      renderDelay
    }
  }

  async start() {
    this.server = new Server(process.cwd())
    this.browser = await puppeteer.launch(this.options.launchOptions)
    this.page = await this.browser.newPage()
    await this.page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36");
    const url = "http://localhost:3000/" + this.options.inputPath
    await this.page.goto(url, {
      waitUntil: "networkidle0",
    })
    if (this.options.renderDelay) {
      await this.page.waitFor(this.options.renderDelay)
    }
    return this.page
  }

  async build() {
    const buf = await this.page.pdf(this.options.pdf)
    if (!this.options.pdf.path) {
      return buf
    }
  }

  async close() {
    await this.browser.close()
    this.server.close()
  }
}

module.exports = HTML5ToPDF
