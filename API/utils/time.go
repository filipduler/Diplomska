package utils

import (
	"log"
	"time"
)

//use this on the start of the function: defer timeTrack(time.Now(), "factorial")
func TimeTrack(start time.Time, name string) {
	elapsed := time.Since(start)
	log.Printf("%s took %s", name, elapsed)
}
