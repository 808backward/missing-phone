# audio/

효과음 파일을 넣는 폴더입니다. 비어 있으면 Web Audio 로 합성한 소리가 대신 재생됩니다.

`js/story.js` 의 `AUDIO` 에 경로를 적으면 해당 파일을 미리 decode 해서 사용합니다.

```js
export const AUDIO = {
  ring: 'audio/ring.mp3',   // 반복 재생되므로 끝과 시작이 자연스럽게 이어지는 파일
  notify: 'audio/notify.mp3',
  // ...
};
```

| 이름 | 쓰이는 곳 |
| --- | --- |
| key | 암호 키패드 |
| unlock | 잠금 해제 |
| ring | 전화 벨소리 (반복) |
| notify | 알림 배너 |
| receive | 보고 있는 방에 메시지 도착 |
| send | 메시지 보냄 |
| alarm | 알람 (반복) |

음성 메모에 실제 녹음을 쓰려면 `VOICE` 항목에 `src: 'audio/파일.m4a'` 를 적으세요.
