// Coder Hearing: macOS's own speech recognition for Coder, a bundle of its own so the system asks its permission in
// both the built app and `dev:app`. Each launch does one thing and writes one line of JSON to the file it was given:
//
//   status <out>                      the permission: {"permission": "allowed" | "denied" | "undetermined"}
//   allow <out>                       asks the permission once, then answers as `status`
//   locales <out>                     the languages this Mac hears: {"locales": ["en-US", ...]}
//   hear <out> <recording> <locale>   the words said: {"text": "..."}, or {"refused": "permission"}, {"failed": "..."}
import Foundation
import Speech

final class Hearing: NSObject, SFSpeechRecognitionTaskDelegate {
  private let out: String
  /**
   * Each stretch of speech between pauses, as macOS finishes it, with the second of the recording it begins at; a long
   * recording comes in several, and the last comes twice where the recording ends in a pause.
   */
  private var heard: [(begins: TimeInterval, words: String)] = []

  init(out: String) {
    self.out = out
  }

  func status() {
    say(["permission": permissionWord(SFSpeechRecognizer.authorizationStatus())])
  }

  func allow() {
    SFSpeechRecognizer.requestAuthorization { granted in
      self.say(["permission": self.permissionWord(granted)])
    }
  }

  func locales() {
    let ids = SFSpeechRecognizer.supportedLocales().map { $0.identifier.replacingOccurrences(of: "_", with: "-") }

    say(["locales": ids.sorted()])
  }

  /** The recognizer and its task at work, held here until the task has finished. */
  private var listening: SFSpeechRecognizer? = nil
  private var task: SFSpeechRecognitionTask? = nil

  func hear(recording: String, locale: String) {
    guard SFSpeechRecognizer.authorizationStatus() == .authorized else {
      say(["refused": "permission"])
      return
    }

    guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: locale)), recognizer.isAvailable else {
      say(["failed": "macOS does not hear \(locale) now"])
      return
    }

    let request = SFSpeechURLRecognitionRequest(url: URL(fileURLWithPath: recording))

    request.shouldReportPartialResults = false
    request.requiresOnDeviceRecognition = recognizer.supportsOnDeviceRecognition
    listening = recognizer

    task = recognizer.recognitionTask(with: request, delegate: self)
  }

  func speechRecognitionTask(_ task: SFSpeechRecognitionTask, didFinishRecognition result: SFSpeechRecognitionResult) {
    let said = result.bestTranscription
    let stretch = (begins: said.segments.first?.timestamp ?? 0, words: said.formattedString)

    // A stretch is told by where it begins: one handed over again takes its own place, never a second one.
    if let last = heard.last, last.begins == stretch.begins {
      heard[heard.count - 1] = stretch
      return
    }

    heard.append(stretch)
  }

  /** The whole recording heard: every stretch, in order, as one text. */
  func speechRecognitionTask(_ task: SFSpeechRecognitionTask, didFinishSuccessfully successfully: Bool) {
    let text = heard.map { $0.words }.filter { !$0.isEmpty }.joined(separator: " ")

    if successfully || !text.isEmpty {
      say(["text": text])
      return
    }

    guard let failure = task.error else {
      say(["text": ""])
      return
    }

    heardNothingOr(failure)
  }

  /** Silence ends the task with an error of its own, which is an empty hearing rather than a failure. */
  private func heardNothingOr(_ failure: Error) {
    let code = (failure as NSError).code

    if code == 1110 || code == 203 {
      say(["text": ""])
      return
    }

    say(["failed": failure.localizedDescription])
  }

  private func permissionWord(_ status: SFSpeechRecognizerAuthorizationStatus) -> String {
    switch status {
    case .authorized:
      return "allowed"
    case .notDetermined:
      return "undetermined"
    default:
      return "denied"
    }
  }

  private func say(_ answer: [String: Any]) {
    let line = (try? JSONSerialization.data(withJSONObject: answer)) ?? Data()

    FileManager.default.createFile(atPath: out, contents: line)
    exit(0)
  }
}

let args = CommandLine.arguments

guard args.count >= 3 else {
  exit(2)
}

let hearing = Hearing(out: args[2])

switch args[1] {
case "status":
  hearing.status()
case "allow":
  hearing.allow()
case "locales":
  hearing.locales()
case "hear" where args.count >= 5:
  hearing.hear(recording: args[3], locale: args[4])
default:
  exit(2)
}

dispatchMain()
